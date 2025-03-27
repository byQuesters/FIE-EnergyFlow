
## UNIVERSIDAD DE COLIMA
## FACULTAD DE INGENIERIA ELECTROMECANICA

## ENERGY FLOW


---

# 🌟 Digital Twin of the FIE 🌟

Welcome to the **Digital Twin of the Faculty of Engineering (FIE)** project!  
This repository hosts the complete solution for implementing a **real-time energy monitoring system** that leverages **IoT technologies**, **cloud data storage**, and an **interactive web interface** to optimize energy consumption management.

---

## 📖 Project Overview

The **Digital Twin** project aims to create a virtual representation of the **electrical energy consumption** in the Faculty of Engineering.  
It leverages **Photon microcontrollers** to collect data from various locations, sending this information via the **MQTT protocol** to a centralized **Linux server**.  
Data is then stored in a **PostgreSQL database** and visualized in real-time through an intuitive **web application built with React**.  

### 🌐 Objectives
- **Monitor electrical variables (voltage, current, power) in real time.**
- **Store data securely and efficiently for long-term analysis.**
- **Provide a dynamic and interactive dashboard for data visualization.**
- **Enable early detection of anomalies or irregular consumption patterns.**
- **Facilitate predictive analytics and trend analysis in future iterations.**

---

## 🧩 Key Features

### 🔥 Real-Time Data Monitoring
- Collection of **voltage (Vrms)**, **current (A)**, and **power (kW)** metrics.
- Real-time data transmission using **MQTT** protocol for minimal latency.

### 💾 Data Storage and Management
- Structured storage in **PostgreSQL** for reliable and consistent data handling.
- Historical data retention for trend analysis and report generation.

### 🖥️ Interactive Web Interface
- Developed using **React** with a modern and responsive design.
- Visualizes real-time data through **dynamic charts and graphs**.
- Allows customization of viewing preferences and data filtering.

### 🔔 Alerts and Notifications (Planned)
- Real-time notifications when abnormal patterns are detected.
- Configurable alert thresholds to detect potential overloads or anomalies.

---

## 🏗️ Architecture

The project architecture follows a **modular and scalable approach**, integrating multiple technologies to ensure performance and flexibility.  

```plaintext
            +----------------------+
            |    Photon Sensors     |
            +----------+------------+
                       |
                (Voltage, Current, Power)
                       |
           +-----------v------------+
           |       MQTT Broker       |
           |      (Linux Server)     |
           +-----------+------------+
                       |
                (Real-Time Data)
                       |
           +-----------v------------+
           |     PostgreSQL DB       |
           |    (Data Persistence)   |
           +-----------+------------+
                       |
                (Query and Retrieval)
                       |
           +-----------v------------+
           |    Web Interface (React) |
           |     (Visualization)     |
           +-------------------------+
```


## COLORES:
#ccdb94 - SUBTITULOS
rgb(204 219 148 / 20%) - SUBFONDOS
#7b8f35 - TITULOS Y BOTONES
#a3bf42 - DETALLES
#5f5ea3 - DETALLES OSCUROS
=======
>>>>>>> 3c0cda0c6c0a317bad29345335b13fa07b2ba708
