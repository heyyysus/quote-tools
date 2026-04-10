
export interface FormDropdownMenuProps {
  label: string;
  onChange?: (val: string) => void;
  values: string[];
  value: string;
}; 

export const ArrayRange = (start: number, stop: number, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);

export const FormDropdownMenu = ({ label, values, onChange, value }: FormDropdownMenuProps) => {
    return(
    <div className="flex w-full items-center text-black flex-col mb-[15px] ">
        <div className="w-4/5 md:w-1/2 flex flex-col">
          <label htmlFor="fname" className="mb-[5px] font-medium text-lg">{label}: </label>
            <select name={label} id={label} className="text-lg p-[15px] border rounded-md border-black" 
                onChange={(e) => {onChange && onChange(e.target.value)}} value={value}>
                {values.map((y) => <option key={y} value={`${y}`}>{y}</option>)}
            </select>
        </div>
    </div>
    );
}

export interface FormInputProps {
  label: string;
  type?: "text" | "date" | "email" | "tel";
  onChange?: (val: string) => void;
  onBlur?: () => void;
  value: string;
  pattern?: string;
  placeholder?: string;
  required?: boolean;
}; 



export const FormInput = ({ label, type, pattern, placeholder, onChange, onBlur, value, required }: FormInputProps) => {
  return (
    <div className="flex w-full items-center text-black flex-col mb-[15px]">
        <div className="w-4/5 md:w-1/2 flex flex-col">
          <label htmlFor="fname" className="mb-[5px] font-medium text-lg">{label} {required && 
            <span className="text-sm text-red-500">*</span>}</label>
          <input
            id="fname"
            type={ type || "text" }
            className="text-lg p-[12px] text-black placeholder:text-grey border border-black rounded-md"
            pattern={pattern}
            placeholder={placeholder}
            onBlur={onBlur}
            onChange={(e) => {onChange && onChange(e.target.value)}}
            value={value}
            required={required}
          />
        </div>
      </div>
  );
      
}

export const FormZipInput = ({ label, onChange, value, required }: FormInputProps) => {
  return (
    <div className="flex w-full items-center text-black flex-col mb-[15px]">
        <div className="w-4/5 md:w-1/2 flex flex-col">
          <label htmlFor="fname" className="mb-[5px] font-medium text-lg">{label} 
            {required && 
            <span className="text-md text-red-500">*</span>}
          </label>
          <input
            id="fname"
            type={ "text" }
            className="text-lg p-[12px] text-black placeholder:text-black outline-2 focus:outline-3 outline-black rounded-md focus:outline-indigo-950"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="postal-code"
            maxLength={5} 
            value={value}
            required
            onChange={(e) => { onChange && onChange(e.target.value || ""); return false; }}
          />
        </div>
      </div>
  );
      
}

