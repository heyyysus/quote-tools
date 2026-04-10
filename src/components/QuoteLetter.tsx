import { Driver, Vehicle } from "../App";
import React, { useRef } from "react";
import {ArrayRange} from './FormItems';

export interface QuoteLetterProps {
    effective: string;
    ni_name: string;
    ni_addr: string;
    ni_city: string;
    ni_zip: string;
    ni_phone: string;
    bi: string;
    pd: string;
    med: string;
    umbi: string;
    umpd: string;
    vehicles: Vehicle[];
    drivers: Driver[];
    ref: React.RefObject<HTMLDivElement | null>;
    dp?: string;
    mp: string;
    term: string;
};

export const QuoteLetter = ({ effective, bi, pd, med, umbi, umpd, vehicles, drivers, ref, ni_name, ni_addr, ni_city, ni_zip, ni_phone, dp, mp, term }: QuoteLetterProps) => {
    
    const NUM_PAY = (term === "6 Months") ? 5 : 11;
    
    return (
        <div className="flex flex-col pY-10 px-20 mt-10" ref={ref}>
            <div className="font-extrabold flex justify-center "><h1>PERSONAL AUTO INSURANCE QUOTE</h1></div>
            <div className="flex flex-row justify-between">
                
                <div className="flex flex-col">
                    <h1 className="mt-5"><b className="underline ">EFFECTIVE DATE:</b> {effective}</h1>
                    <h1 className="underline mt-5"><b>NAMED INSURED:</b></h1>
                    <h2>{ni_name}</h2>
                    <h2>{ni_addr}</h2>
                    <h2>{ni_city}, CA {ni_zip}</h2>
                    <h2>{ni_phone}</h2>

                    <h1 className="underline mt-5"><b>POLICY COVERAGES:</b></h1>
                    <h2><b>BI Limits:</b> {bi}</h2>
                    <h2><b>PD Limit:</b> {pd}</h2>
                    <h2><b>MEDPAY Limit:</b> {med}</h2>
                    <h2><b>UMBI Limits:</b> {umbi}</h2>
                    <h2><b>UMPD/CDW Limit:</b> {umpd}</h2>

                    <h1 className="underline mt-5"><b>VEHICLE COVERAGES:</b></h1>
                    {vehicles.map((a,i) => <span key={i} className="my-2">{`${i+1}. ${a.year} ${a.make} ${a.model}`}
                        <p><b>COMP:</b> {a.comp}</p>
                        <p><b>COLL:</b> {a.coll}</p>
                    </span>)}

                    <h1 className="underline mt-5"><b>ADDITIONAL DRIVERS:</b></h1>
                    {drivers.map((d,i) => <span key={i}> {i+1}. {d.name}, {d.dob}, {d.marital} </span>)}
                </div>
                <div className="flex flex-col p-5">
                    <h1 className=""><b className="underline ">TERM: </b>{term}</h1>
                    <h1 className="mt-5"><b className="underline">PAYMENT SCHEDULE:</b></h1>
                    {dp && <h2><b>Initial Payment:</b> ${dp}</h2>}
                    {dp && ArrayRange(1, NUM_PAY).map((v) => <h2><b>Installment {v+1}:</b> ${mp}</h2>)}
                    {!dp && ArrayRange(0, NUM_PAY).map((v) => <h2><b>Installment {v+1}:</b> ${mp}</h2>)}
                </div>
            </div>
        </div>
    );
};