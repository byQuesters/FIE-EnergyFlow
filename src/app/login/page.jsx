import styles from "./styles.css";
import React from "react";

export default function Login() {
  return (
    <div>
      <div className="loginview">
        <div className="logincard">
          <img src="/UCOL_Icon.png" className="logoucol" alt="" />
          <h1>ENERGY FLOW</h1>
          <form action="login">
            <input type="text" name="username" placeholder="Usuario" />
            <input type="password" name="password" placeholder="Contraseña" />
            <button type="submit">Iniciar Sesion</button>
          </form>
        </div>
      </div>
    </div>
  );
}