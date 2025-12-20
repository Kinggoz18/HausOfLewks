
export default function Input(props) {
  const { 
    inputName, 
    label, 
    onChange, 
    value, 
    placeholder,
    type = "text",
    required = false,
    ariaLabel,
    ariaDescribedBy,
    error,
    ...rest
  } = props;
  
  const inputId = inputName || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="w-full">
      <label 
        className="font-semibold text-sm sm:text-base" 
        htmlFor={inputId}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      <input
        id={inputId}
        name={inputName}
        type={type}
        value={value}
        onChange={onChange}
        className={`outline-0 py-2 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-2 text-sm sm:text-base focus:ring-2 focus:ring-primary-purple focus:bg-white transition-colors ${error ? 'border-2 border-red-500' : ''}`}
        placeholder={placeholder}
        required={required}
        aria-label={ariaLabel || label}
        aria-describedby={error ? `${inputId}-error` : ariaDescribedBy}
        aria-invalid={error ? 'true' : 'false'}
        {...rest}
      />
      {error && (
        <p 
          id={`${inputId}-error`}
          className="text-red-600 text-xs sm:text-sm mt-1 mb-2"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
