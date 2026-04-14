import React, { useRef } from 'react';
import { useReactToPrint } from "react-to-print";


import { FormDropdownMenu, FormInput, ArrayRange  } from './components/FormItems';
import { QuoteLetter } from './components/QuoteLetter';
import CarModels from "./components/car-models.json";


export interface Vehicle {
  year: string;
  make: string;
  model: string;
  comp?: string | null;
  coll?: string | null;
  rrem?: string | null;
};

export interface Driver {
  name: string;
  dob: string;
  marital: string;
};

function App() {

  

  const [agent, setAgent] = React.useState("");
  const AGENT_LIST = [
    "", 
    "Jesus Velarde", 
    "Yasmin Alfaro", 
    "Fernando Salgado", 
    "Samuel Rodriguez",
    "Laura Figueroa",
    "Jorge Ramos",
  ];
  const [ effective, set_effective ] = React.useState("");
  const [ ni_name, set_ni_name ] = React.useState("");
  const [ ni_addr, set_ni_addr ] = React.useState("");
  const [ ni_city, set_ni_city ] = React.useState("");
  const [ ni_zip, set_ni_zip ] = React.useState("");
  const [ ni_phone, set_ni_phone ] = React.useState("");

  const BI_VALUES = ["30/60", "50/100", "100/300", "250/500", "500 CSL"];
  const [ bi_value, set_bi_value ] = React.useState("30/60");

  const PD_VALUES = ["NONE (CSL)", "15", "25", "50", "100", "250"];
  const [ pd_value, set_pd_value ] = React.useState("15");

  const MED_VALUES = ["NONE", "500", "1,000", "2,000", "5,000", "10,000", "25,000", "50,000"];
  const [ med_value, set_med_value ] = React.useState("None");

  const UMBI_VALUES = ["NONE", "30/60", "50/100", "100/300", "250/500", "500 CSL"];
  const [ umbi_value, set_umbi_value ] = React.useState("NONE");

  const UMPD_VALUES = ["NONE", "3.5k UMPD/CDW"]
  const [ umpd_value, set_umpd_value ] = React.useState("NONE");

  const [ autoYearCache, setAutoYearCache ] = React.useState("");
  const [ autoMakeCache, setAutoMakeCache ] = React.useState("");
  const [ autoModelCache, setAutoModelCache ] = React.useState("");

  const year_values = ["", ...ArrayRange(1981, 2027).reverse().map((y) => y.toString()), "Pre-1981"];
  const make_values = ["", ...CarModels.map(m => m.brand)];
  const model_values = CarModels.find((e) => e.brand === autoMakeCache)?.models;

  const [ autoCompCache, setAutoCompCache ] = React.useState("NONE");
  const [ autoCollCache, setAutoCollCache ] = React.useState("NONE");
  const [ autos, setAutos ] = React.useState<Vehicle[]>([]);

  const [ driverNameCache, setDriverNameCache ] = React.useState("");
  const [ driverDOBCache, setDriverDOBCache ] = React.useState("");
  const [ driverMaritalCache, setDriverMaritalCache ] = React.useState("Single");
  const [ drivers, setDrivers ] = React.useState<Driver[]>([]);

  const DED_VALUES = ["NONE", "250", "500", "750", "1000", "1500", "2000", "2500"];

  const contentRef = useRef<HTMLDivElement>(null);

  const HandlePrint = useReactToPrint({ contentRef });
  
  const AddAuto = (auto: Vehicle) => {
    setAutos([...autos, auto]);
  }

  const [ term, set_term ] = React.useState("6 Months");
  const [ dp, set_dp ] = React.useState("");
  const [ mp, set_mp ] = React.useState("");

  return (
    <div className="flex flex-row justify-center items-center pb-10">
      <div>
        <div className='min-w-[600px] min-h-[200px] p-10 border border-black mt-10 rounded-lg'>
          <FormDropdownMenu label="Agent Name" value={agent} onChange={setAgent} values={AGENT_LIST} />

          <FormInput label="Effective" type="date" value={effective} onChange={(v) => {set_effective(v)}} />
          <FormInput label="Name" value={ni_name} onChange={set_ni_name} />
          <FormInput label="Address" value={ni_addr} onChange={set_ni_addr} />
          <FormInput label="City" value={ni_city} onChange={set_ni_city} />
          <FormInput label="ZIP Code" value={ni_zip} onChange={set_ni_zip} />
          <FormInput label="Phone Number" value={ni_phone} onChange={set_ni_phone} />

          <FormDropdownMenu label="BI" value={bi_value} values={BI_VALUES} onChange={set_bi_value} />
          <FormDropdownMenu label="PD" value={pd_value} values={PD_VALUES} onChange={set_pd_value} />
          <FormDropdownMenu label="MED" value={med_value} values={MED_VALUES} onChange={set_med_value} />
          <FormDropdownMenu label="UMBI" value={umbi_value} values={UMBI_VALUES} onChange={set_umbi_value} />
          <FormDropdownMenu label="UMPD/CDW" value={umpd_value} values={UMPD_VALUES} onChange={set_umpd_value} />
          
        </div>
        <div className='min-w-[600px] p-2 border border-black mt-10 ml-10 mb-5 rounded-lg flex flex-col justify-content'>
          <FormInput value={driverNameCache} onChange={setDriverNameCache} label="Name" />
          <FormInput value={driverDOBCache} onChange={setDriverDOBCache} label="Date of Birth" type="date" />
          <FormDropdownMenu value={driverMaritalCache} onChange={setDriverMaritalCache} label="Marital Status" values={["Single", "Married"]} />
          <button
            className=" bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-2 px-4 rounded-lg transition cursor-pointer mt-[40px]"
            onClick={() => { setDrivers(prev => [...prev, { name: driverNameCache, dob: driverDOBCache, marital: driverMaritalCache }]);
            setDriverNameCache(""); setDriverDOBCache(""); setDriverMaritalCache("Single"); }}
          >Add</button>
        </div>

        <div className='min-w-[400px] w-1/3 min-h-[200px] p-10 border border-black ml-10 rounded-lg '>
          <h2 className='text-lg font-semibold'>Drivers: </h2>
            
              { drivers.map((d,i) => (<b key={i}>
              <p>{`${i+1}. ${d.name}, ${d.dob}, ${d.marital}`}</p>
              </b>)) }
              
              <button
              className=" bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-2 px-4 rounded-lg transition cursor-pointer mt-[40px]"
              onClick={() => { setDrivers( prev => prev.slice(0, -1) ) }}
            >Delete</button>

        </div>

      </div>


      <div>
        <div className='p-2 border border-black mt-10 ml-10 mb-5 rounded-lg flex flex-col justify-content'>
          <FormDropdownMenu label="Year" value={autoYearCache} values={year_values} onChange={setAutoYearCache} />
          <FormDropdownMenu label="Make" value={autoMakeCache} values={make_values} onChange={setAutoMakeCache} />
          <FormDropdownMenu label="Model" value={autoModelCache} values={model_values || []} onChange={setAutoModelCache} />
          <FormDropdownMenu label="Comp" values={DED_VALUES} value={autoCompCache} onChange={setAutoCompCache}  />
          <FormDropdownMenu label="Coll" values={DED_VALUES}  value={autoCollCache} onChange={setAutoCollCache} />

          <button
            className=" bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-2 px-4 rounded-lg transition cursor-pointer mt-[40px]"
            onClick={() => { AddAuto({
              year: autoYearCache,
              make: autoMakeCache,
              model: autoModelCache,
              comp: autoCompCache,
              coll: autoCollCache,
            }); setAutoYearCache(""); setAutoMakeCache(""); setAutoModelCache("");}}
          >Add</button>

        </div>

        <div className='min-w-[400px] w-1/3 min-h-[200px] p-10 border border-black ml-10 rounded-lg '>
          <h2 className='text-lg font-semibold'>Autos: </h2>
            { autos.map((a,i) => (<b key={i}>
              <p>{`${i+1}. ${a.year} ${a.make} ${a.model}`}</p>
              {a.comp && <p> Comp: {a.comp}</p>}
              {a.coll && <p> Coll: {a.coll}</p>}
              </b>)) }
              
              <button
              className=" bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-2 px-4 rounded-lg transition cursor-pointer mt-[40px]"
              onClick={() => { setAutos(prev => prev.slice(0, -1)); }}
            >Delete</button>

        </div>

        <div className='min-w-[400px] w-1/3 min-h-[200px] p-10 mt-5 border border-black ml-10 rounded-lg'>
              <FormDropdownMenu label="Term" value={term} values={["6 Months", "12 Months"]} onChange={set_term} />
              <FormInput label="Down Payment" value={dp} onChange={set_dp} />
              <FormInput label="Monthly Installments" value={mp} onChange={set_mp} />

        </div>

          <QuoteLetter effective={effective} bi={bi_value} pd={pd_value} med={med_value} umbi={umbi_value} umpd={umpd_value} vehicles={autos} ref={contentRef} 
            ni_name={ni_name} ni_addr={ni_addr} ni_city={ni_city} ni_zip={ni_zip} ni_phone={ni_phone} dp={dp} mp={mp} term={term}
            drivers={drivers} agent={agent}
          /> 

      
          
      <button
              className=" bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-2 px-4 rounded-lg transition cursor-pointer mt-[40px]"
              onClick={() => { HandlePrint(); }}
            >Print</button>

      </div>

       

    </div>
  );
}

export default App;
