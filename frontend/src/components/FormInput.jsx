
// Reusable form input component with label, error handling, and styling
const FormInput = ({ label, type = "text", name, value, onChange, error, placeholder }) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block font-semibold text-slate-700 mb-1 text-xs"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full outline-none transition text-sm text-slate-800 placeholder-slate-400 px-3 py-2 border rounded-lg ${
          error 
            ? 'bg-red-50 border-red-500' 
            : 'bg-slate-50 border-slate-200 focus:border-blue-500'
        }`}
      />
      {error && (
        <p className="mt-1 text-red-500 text-xs">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
