import React from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Aquí importas tu imagen. 
// (Asegúrate de tener un archivo llamado así en la carpeta assets, o cambia el nombre)
import heroImg from '../assets/UMG-LOGO.svg'; 

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-grid"></div>
      <div className="hero-accent"></div>
      
      {/* Usamos flexbox para poner el texto y la imagen lado a lado */}
      <div className="hero-inner" style={{ display: 'flex', alignItems: 'center', gap: '3rem', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Lado Izquierdo: Texto */}
        <div style={{ flex: 1 }}>
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Inscripciones abiertas
          </div>
          
          <h1>CONGRESO<br /><span>2026</span> UMG</h1>
          
          <p className="hero-sub">
            El evento académico más importante del año. Elige las charlas de tu interés, realiza tu pago y confirma tu asistencia con tecnología QR.
          </p>
          
          <div className="hero-meta">
            <span className="meta-chip">📅 15–17 de octubre, 2026</span>
            <span className="meta-chip">📍 Campus Central UMG</span>
            <span className="meta-chip">🎤 12 ponentes</span>
            <span className="meta-chip">⏱ 30+ charlas simultáneas</span>
          </div>
          
          <div className="hero-ctas">
            <button className="btn-lg btn-lg-primary" onClick={() => navigate('/inscripcion')}>
              Inscribirme al congreso
            </button>
            <button className="btn-lg btn-lg-outline" onClick={() => navigate('/agenda')}>
              Ver agenda
            </button>
          </div>
        </div>

        {/* Lado Derecho: Imagen */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {/* 2. Aquí usas la variable importada */}
          <img 
            src={heroImg} 
            alt="Congreso UMG" 
            style={{ width: '100%', maxWidth: '450px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} 
          />
        </div>

      </div>
    </section>
  );
}