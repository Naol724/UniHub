
// Reusable form input component with label, error handling, and styling
const FormInput = ({ label, type = "text", name, value, onChange, error, placeholder }) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block font-bold text-gray-700 mb-1"
          style={{ fontSize: "12px" }}
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
        className="w-full outline-none transition text-sm text-gray-800 placeholder-gray-400"
        style={{
          padding: "9px 13px",
          borderRadius: "10px",
          background: error ? "#fff5f5" : "#f8fafc",
          border: error ? "1px solid #f87171" : "1px solid #e2e8f0",
        }}
      />
      {error && (
        <p className="mt-1 text-red-500" style={{ fontSize: "11px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
