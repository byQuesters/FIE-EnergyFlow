
## UNIVERSIDAD DE COLIMA
## FACULTAD DE INGENIERIA ELECTROMECANICA

## ENERGY FLOW


---

## 📌 Overview

This project integrates sensors (Photon boards) installed at strategic points within the faculty's electrical network. These sensors measure various parameters, including voltage, current, and power. Data is transmitted via the MQTT protocol to a Linux server, stored in a PostgreSQL database, and made available in a user-friendly web application developed with React.

### Key Components
- **Photon**: Embedded devices for electrical variable measurement
- **Linux Server**: Centralized platform for data processing
- **MQTT**: Lightweight publish/subscribe protocol for IoT communication
- **PostgreSQL**: Robust relational database system for data storage
- **React**: Front-end framework for real-time data visualization

---

## ⚙️ Prerequisites

- **Node.js** (with npm or yarn) for the React application
- **PostgreSQL** installed and running
- **MQTT Broker** (e.g., Mosquitto) installed on a Linux server
- **Photon devices** configured to transmit data

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More
DOCUMENTACION DEL PROYECTO
