import React from "react";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="wrap">
      <div className="card">
        <h1 className="title">{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
        {children}
      </div>

      <style jsx>{`
        .wrap {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background-image: url('/bg-screen.png');
          background-repeat: no-repeat;
          background-size: cover; 
          background-position: center center;
        }
        .card {
          width: 100%;
          max-width: 680px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
          padding: 32px;
        }
        .title {
          font-size: 32px;
          line-height: 1.15;
          margin: 0 0 6px;
          font-weight: 800;
        }
        .subtitle {
          margin: 0 0 24px;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}