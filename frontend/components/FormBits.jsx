import React from "react";

export function TextField({ label, type="text", value, onChange, name, placeholder, disabled }) {
  return (
    <label className="block">
      <span className="lbl">{label}</span>
      <input
        className="inp"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={type === "password" ? "current-password" : "on"}
      />
      <style jsx>{`
        .block { display: block; margin-bottom: 14px; }
        .lbl { display: inline-block; margin-bottom: 6px; color: #374151; font-weight: 600; }
        .inp {
          width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 10px;
          background: #eef4ff; outline: none; transition: box-shadow .15s, border-color .15s;
        }
        .inp:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.25); background: #fff; }
        .inp:disabled { opacity: .7; }
      `}</style>
    </label>
  );
}

export function Checkbox({ checked, onChange, label, name, disabled }) {
  return (
    <label className="chk">
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} name={name} disabled={disabled}/>
      <span>{label}</span>
      <style jsx>{`
        .chk { display: inline-flex; align-items: center; gap: 8px; color: #374151; margin: 8px 0 18px; }
        input { width: 16px; height: 16px; }
      `}</style>
    </label>
  );
}

export function PrimaryButton({ children, disabled }) {
  return (
    <>
      <button className="btn" disabled={disabled}>{children}</button>
      <style jsx>{`
        .btn {
          width: 100%; padding: 14px 16px; border-radius: 12px; border: 0;
          background: #2563eb; color: #fff; font-weight: 700; font-size: 16px;
          cursor: pointer; transition: transform .02s ease-in-out, opacity .2s;
        }
        .btn:hover { transform: translateY(-1px); }
        .btn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>
    </>
  );
}