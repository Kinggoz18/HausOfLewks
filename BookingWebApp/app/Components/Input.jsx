
export default function Input(props) {
  const { inputName, label, onChange, value, placeholder } = props;
  return (
    <>
      <label className="font-semibold" htmlFor={inputName}>{label}</label>
      <input
        name={inputName}
        type="text"
        value={value}
        onChange={onChange}
        className="outline-0 py-2 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-2"
        placeholder={placeholder}
      />
    </>
  );
}
