
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
⚙️ Prerequisites
----------------

-   **Node.js** (with npm or yarn) for the React application.
    
-   **PostgreSQL** installed and running.
    
-   **MQTT Broker** (e.g., Mosquitto) installed on a Linux server.
    
-   **Photon devices** configured to transmit data.
    

* * *

🛠️ Installation and Setup
--------------------------

### 1\. Clone the Repository

Start by cloning this repository to your local environment:

bash

CopiarEditar

`git clone https://github.com/username/digital-twin-fie.git
cd digital-twin-fie` 

### 2\. Server Configuration

#### Install MQTT Broker (Mosquitto) on Linux:

bash

CopiarEditar

`sudo apt update
sudo apt install mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto` 

#### Test the Broker:

bash

CopiarEditar

`mosquitto_sub -h localhost -t "test/topic"` 

### 3\. Database Setup

#### Install PostgreSQL:

bash

CopiarEditar

`sudo apt install postgresql postgresql-contrib` 

#### Create Database and User:

bash

CopiarEditar

`sudo -u postgres psql
CREATE DATABASE energy_monitoring;
CREATE USER twin_admin WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE energy_monitoring TO twin_admin;
\q` 

#### Run Database Migrations:

Navigate to the database scripts directory:

bash

CopiarEditar

`cd server/db
psql -U twin_admin -d energy_monitoring -f create_tables.sql` 

### 4\. Web Application Setup

#### Navigate to the Web Directory:

bash

CopiarEditar

`cd web` 

#### Install Dependencies:

bash

CopiarEditar

`npm install` 

#### Run the Application:

bash

CopiarEditar

`npm start` 

Visit `http://localhost:3000` to access the dashboard.

* * *

💡 Usage Instructions
---------------------

1.  **Connect Photon Devices:**  
    Ensure that all Photon sensors are properly configured and connected to the network.
    
2.  **Monitor Real-Time Data:**  
    Use the **web dashboard** to view voltage, current, and power metrics in real-time.
    
3.  **Historical Data Analysis:**  
    Generate reports and visualize past data trends using the **historical view**.
    
4.  **Anomaly Detection (Planned):**  
    Configure alert thresholds for detecting irregular consumption patterns.
    

* * *

📝 Troubleshooting
------------------

### Common Issues:

-   **Web Application Not Starting:**  
    Check if **Node.js** and **npm** are correctly installed.  
    Run:
    
    bash
    
    CopiarEditar
    
    `node -v
    npm -v` 
    
*   **Database Connection Error:**  
    Verify that PostgreSQL is running and accessible:
    
    bash
    
    CopiarEditar
    
    `sudo systemctl status postgresql` 
    
-   **MQTT Communication Failure:**  
    Make sure the Mosquitto service is active:
    
    bash
    
    CopiarEditar
    
    `sudo systemctl status mosquitto` 
    

* * *

💪 Contributing
---------------

We welcome contributions from the community! To contribute:

1.  Fork the repository.
    
2.  Create a new branch for your feature or bugfix.
    
3.  Commit your changes and push to your fork.
    
4.  Submit a pull request with a detailed description.
    

* * *

🌱 Future Improvements
----------------------

-   Implement advanced data analytics and predictive models.
    
-   Integrate alert notifications via email or SMS.
    
-   Enhance the dashboard with more detailed metrics and data filtering options.
    
-   Add support for additional sensor types.
    

* * *

📜 License
----------

This project is licensed under the **MIT License**. For more details, see the LICENSE file.

* * *

📝 Acknowledgements
-------------------

Special thanks to the Software Engineering team and all contributors who made this project possible.  
Your efforts toward energy efficiency and sustainability make a difference! 💡🌍

* * *

**Maintained by:** Engineering and IoT Development Team  
**Contact:** email@example.com

## COLORES:
#ccdb94 - SUBTITULOS
rgb(204 219 148 / 20%) - SUBFONDOS
#7b8f35 - TITULOS Y BOTONES
#a3bf42 - DETALLES
#5f5ea3 - DETALLES OSCUROS
=======
>>>>>>> 3c0cda0c6c0a317bad29345335b13fa07b2ba708
