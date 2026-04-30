/**
 * parseIntegrationFile.ts
 *
 * Parses a TurboRater .tt2x integration file into a structured quote object
 * ready to be saved via createQuote() in quoteDB.ts.
 *
 * Usage:
 *   const quote = await parseIntegrationFile(file); // file = File object from <input>
 *   await createQuote(quote);
 */

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdditionalDriver {
  name: string;
  dob: string;           // ISO date string e.g. "1990-04-15"
  marital: string; // e.g. "Married" | "Single" | "Divorced" | "Widowed"
}

export interface Auto {
  year: string;
  make: string;
  model: string;
  comp: string; // comprehensive deductible e.g. "1000"
  coll: string; // collision deductible e.g. "1000"
}

export interface Quote {
  id?: number;
  agentName: string;
  effectiveDate: string;
  name: string;
  address: string;
  zipCode: string;
  phoneNo: string;
  bi: string;   // e.g. "100000/300000"
  pd: string;   // e.g. "100000"
  umbi: string;
  umpd: string;
  additionalDrivers: AdditionalDriver[];
  autos: Auto[];
  termLength: string;    // e.g. "6 months"
  downPayment: number;
  monthlyInstallments: number;
}


/** Marital status code map from ACORD single-letter codes. */
const MARITAL_STATUS_MAP: Record<string, string> = {
  M: 'Married',
  S: 'Single',
  D: 'Divorced',
  W: 'Widowed',
  U: 'Unknown',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse an XML string and return the document. Throws on parse errors. */
function parseXML(xmlString: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) throw new Error('XML parse error: ' + err.textContent);
  return doc;
}

/** Return the trimmed text content of the first matching element, or ''. */
function getText(parent: Element | null | undefined, selector: string): string {
  return parent?.querySelector(selector)?.textContent?.trim() ?? '';
}

/**
 * Build a coverage limit string like "100000/300000" or "100000" from a
 * Coverage element. Returns '' if no limits are found.
 */
function parseCoverageLimit(coverageNode: Element | null): string {
  if (!coverageNode) return '';
  const limits = Array.from(coverageNode.querySelectorAll('Limit'));
  const values = limits.map((l) => getText(l, 'FormatInteger'));
  if (values.length === 0) return '';
  if (values.length === 1) return values[0];
  return values.join('/');
}

/**
 * Find the first Coverage child element whose CoverageCd matches `cd`.
 * Returns null if not found.
 */
function findCoverage(parent: Element | null, cd: string): Element | null {
  if (!parent) return null;
  return (
    Array.from(parent.querySelectorAll('Coverage')).find(
      (c) => getText(c, 'CoverageCd') === cd
    ) ?? null
  );
}

/**
 * Extract the best available phone number from a Communications element.
 * Preference order: Cell → Home → Phone (business).
 */
function extractPhone(commNode: Element | null | undefined): string {
  if (!commNode) return '';
  const phones = Array.from(commNode.querySelectorAll('PhoneInfo'));
  const preference = ['Cell', 'Home', 'Phone'] as const;

  for (const type of preference) {
    const match = phones.find(
      (p) => getText(p, 'PhoneTypeCd') === type && getText(p, 'PhoneNumber') !== ''
    );
    if (match) return getText(match, 'PhoneNumber');
  }
  return '';
}

/**
 * Convert an ACORD MaritalStatusCd single letter to a readable string.
 * Falls back to the raw code if not found in the map.
 */
function expandMaritalStatus(cd: string): string {
  return MARITAL_STATUS_MAP[cd] ?? cd;
}

/**
 * Derive a human-readable term length from effective and expiration date strings.
 * Returns e.g. "6 months" or "12 months". Returns '' if either date is missing.
 */
function deriveTerm(effectiveDt: string, expirationDt: string): string {
  if (!effectiveDt || !expirationDt) return '';
  const start = new Date(effectiveDt);
  const end = new Date(expirationDt);
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  return `${months} months`;
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

/**
 * Parse a .tt2x File object and return a Quote object ready to be saved.
 *
 * @param file - The .tt2x file selected by the user via a file input.
 * @returns A Promise that resolves to the parsed Quote.
 */
export async function parseIntegrationFile(file: File): Promise<Omit<Quote, 'id'>> {
  // 1. Read the raw file text
  const raw = await file.text();

  // 2. The .tt2x file is plain-text key::value format with \r\n line endings.
  //    The ACORD XML is embedded inline immediately after "bridgedata::" with no
  //    newline separator. Locate it by finding the first "<?xml" occurrence.
  let xmlString: string;

  const xmlStart = raw.indexOf('<?xml');
  if (xmlStart !== -1) {
    xmlString = raw.slice(xmlStart);
  } else {
    throw new Error(
      'Could not locate XML content in the file. ' +
      'Expected to find "<?xml" after the "bridgedata::" key.'
    );
  }

  // 3. Parse the XML document
  const doc = parseXML(xmlString);

  // ── Policy-level nodes ───────────────────────────────────────────────────
  const persPolicy = doc.querySelector('PersPolicy');
  const appInfo    = doc.querySelector('PersApplicationInfo');

  // ── Insured ──────────────────────────────────────────────────────────────
  const insuredNode = appInfo?.querySelector('InsuredOrPrincipal') ?? null;
  const insuredInfo = insuredNode?.querySelector('GeneralPartyInfo') ?? null;

  const surname  = getText(insuredInfo, 'Surname');
  const given    = getText(insuredInfo, 'GivenName');
  const middle   = getText(insuredInfo, 'OtherGivenName');
  const fullName = [given, middle, surname].filter(Boolean).join(' ');

  const insuredAddr = insuredInfo?.querySelector('Addr') ?? null;
  const addr1   = getText(insuredAddr, 'Addr1');
  const zip     = getText(insuredAddr, 'PostalCode');
  const address = [addr1].filter(Boolean).join(', ');

  const insuredComm = insuredInfo?.querySelector('Communications') ?? null;
  const phoneNo = extractPhone(insuredComm);

  // ── Dates / Term ─────────────────────────────────────────────────────────
  const effectiveDate = getText(persPolicy, 'EffectiveDt');
  const expirationDt  = getText(persPolicy, 'ExpirationDt');
  const termLength    = deriveTerm(effectiveDate, expirationDt);

  // ── Payment ──────────────────────────────────────────────────────────────
  const paymentOption       = doc.querySelector('PaymentOption');
  const downPayment         = parseFloat(getText(paymentOption, 'DepositAmt Amt')) || 0;
  const monthlyInstallments = parseFloat(getText(paymentOption, 'InstallmentAmt Amt')) || 0;

  // ── Coverages (pulled from Veh1 — limits are policy-wide) ────────────────
  const vehicles = Array.from(doc.querySelectorAll('PersVeh'));
  const veh1     = vehicles[0] ?? null;

  const bi   = parseCoverageLimit(findCoverage(veh1, 'BI'));
  const pd   = parseCoverageLimit(findCoverage(veh1, 'PD'));
  const umbi = parseCoverageLimit(findCoverage(veh1, 'UM'));
  const umpd = parseCoverageLimit(findCoverage(veh1, 'UMPD'));

  // ── Vehicles ─────────────────────────────────────────────────────────────
  const autos: Auto[] = vehicles.map((veh) => ({
    year:  getText(veh, 'ModelYear'),
    make:  getText(veh, 'Manufacturer'),
    model: getText(veh, 'Model'),
    comp:  getText(findCoverage(veh, 'COMP'), 'Deductible FormatInteger'),
    coll:  getText(findCoverage(veh, 'COLL'), 'Deductible FormatInteger'),
  }));

  // ── Additional Drivers ───────────────────────────────────────────────────
  // Primary insured has DriverRelationshipToApplicantCd = "IN"; skip them.
  const additionalDrivers: AdditionalDriver[] = Array.from(
    doc.querySelectorAll('PersDriver')
  )
    .filter((drv) => getText(drv, 'DriverRelationshipToApplicantCd') !== 'IN')
    .map((drv) => {
      const driverName = [
        getText(drv, 'GivenName'),
        getText(drv, 'OtherGivenName'),
        getText(drv, 'Surname'),
      ]
        .filter(Boolean)
        .join(' ');

      return {
        name:          driverName,
        dob:           getText(drv, 'BirthDt'),
        marital: expandMaritalStatus(getText(drv, 'MaritalStatusCd')),
      };
    });

  // ── Assemble & Return ─────────────────────────────────────────────────────
  return {
    agentName: '', // intentionally omitted per requirements
    effectiveDate,
    name:    fullName,
    address,
    zipCode: zip,
    phoneNo,
    bi,
    pd,
    umbi,
    umpd,
    additionalDrivers,
    autos,
    termLength,
    downPayment,
    monthlyInstallments,
  };
}

// ─── React Hook ───────────────────────────────────────────────────────────────

interface UseIntegrationFilePickerReturn {
  quote:      Omit<Quote, 'id'> | null;
  error:      string | null;
  loading:    boolean;
  handleFile: (file: File | null | undefined) => Promise<void>;
}

/**
 * Drop-in React hook that wires a file <input> to the parser.
 *
 * Usage:
 *   const { quote, error, loading, handleFile } = useIntegrationFilePicker();
 *
 *   <input
 *     type="file"
 *     accept=".tt2x"
 *     onChange={(e) => handleFile(e.target.files?.[0])}
 *   />
 */
export function useIntegrationFilePicker(): UseIntegrationFilePickerReturn {
  const [quote,   setQuote]   = useState<Omit<Quote, 'id'> | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleFile(file: File | null | undefined): Promise<void> {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const parsed = await parseIntegrationFile(file);
      setQuote(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return { quote, error, loading, handleFile };
}