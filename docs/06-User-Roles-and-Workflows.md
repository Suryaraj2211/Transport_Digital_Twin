# 06. User Roles, Permissions Matrix & Operational Workflows

**Document Version:** 1.0.0  
**Status:** Approved Security & Workflow Blueprint  
**Scope:** Multi-Tenant Role-Based Access Control (RBAC), Privacy Boundaries & Critical Operational Sequences  

---

## 1. Enterprise Role-Based Access Control (RBAC) Architecture

To support organizations ranging from a single-truck owner-operator to a 500-vehicle transport enterprise with regional branch offices, the platform enforces a granular, multi-tenant RBAC system. 

```mermaid
graph TD
    SuperAdmin["1. Super Admin (Platform Operator)"]
    
    subgraph TenantDomain["Tenant Organization Boundary"]
        EnterpriseOwner["2. Transport Enterprise Owner / Fleet Owner"]
        BranchManager["3. Regional Branch / Hub Manager"]
        FleetManager["4. Dispatcher / Fleet Operations Manager"]
        Accountant["5. Fleet Accountant / Billing Clerk"]
        VehicleOwner["6. Independent Lorry Owner (Sub-contracted Asset)"]
    end
    
    subgraph FieldOperatives["Field Operatives & External Stakeholders"]
        Driver["7. Commercial Heavy Vehicle Driver"]
        Customer["8. Customer / Consignor / Consignee"]
        WorkshopVendor["9. Maintenance Workshop / Service Partner"]
    end

    SuperAdmin -.->|Global Oversight| TenantDomain
    EnterpriseOwner --> BranchManager
    EnterpriseOwner --> FleetManager
    EnterpriseOwner --> Accountant
    EnterpriseOwner --> VehicleOwner
    FleetManager <--> Driver
    FleetManager <--> Customer
    FleetManager <--> WorkshopVendor
```

---

## 2. Granular Permissions Matrix

The table below details permissions across the CRUD lifecycle (Create, Read, Update, Delete, Approve):

| Role | Vehicle Management | Driver & Assignment | Live Tracking & Map | Trips & Orders | Expenses & Fuel | Invoicing & Financials | Maintenance & Spares | System & Settings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Super Admin** | Full (Global) | Full (Global) | Full (Global) | Full (Global) | Full (Global) | Full (Global) | Full (Global) | System Configuration & Multi-Tenant Management |
| **2. Enterprise / Fleet Owner** | CRUD + Archive | CRUD + Onboard | View All + History | CRUD + Approve | CRUD + Approve | Full P&L + GST Reports | CRUD + Approve Work Orders | Org Settings, Team Invite, Subscription |
| **3. Branch / Hub Manager** | Read Branch Assets | Read + Request Assign | View Branch Assets | CRUD Branch Trips | Read + Verify Slips | Read Branch Invoices | Create Service Requests | View Branch Members |
| **4. Fleet Manager / Dispatcher** | Read + Update Status | CRUD Assignments | View All Real-Time | Create + Dispatch + Monitor | Read + Verify Slips | No Financial Access | Create Job Cards | Manage Geofences & Operational Alerts |
| **5. Fleet Accountant** | Read Asset Info | Read Driver Salary/Bata | No Real-Time Map | Read Completed Trips | Audit + Approve Slips | CRUD Invoices + GST + P&L | Audit Repair Invoices | Export Tax Reports |
| **6. Independent Lorry Owner** | Read/Update Own Truck | View Assigned Driver | View Own Truck Only | Read Own Trips | View Own Truck Expenses | View Own Truck P&L | View Own Truck Health | Manage Own Documents |
| **7. Commercial Driver** | Read Assigned Lorry | View Profile + Bata | Self-Location Only | View Assigned + POD Sign | Upload Fuel & Expense Slips | View Earnings / Advances | Log Breakdown / Defect | Update App Language & Profile |
| **8. Customer (Consignor)** | No Access | No Access | Track Active Order Link | Create Booking Order | No Access | View / Pay Consignment Invoices | No Access | Manage Delivery Addresses |
| **9. Workshop Vendor** | Read Vehicle Specs | No Access | No Access | No Access | Submit Parts Invoice | Submit Repair Bills | CRUD Work Order Items | Workshop Profile |

---

## 3. Strict Data Privacy Boundaries

1. **Driver Off-Duty Privacy Wall:**
   - When a driver taps **"End Duty"** or completes a trip, all GPS coordinates collection terminates immediately at the operating system level.
   - Fleet managers and owners have **zero visibility** into the driver’s off-duty whereabouts. The dashboard displays the status as `OFFLINE` and shows only the last known on-duty location timestamp.
2. **Financial Confidentiality:**
   - Drivers cannot view freight rates, consignor invoice amounts, or company profit margins. They can only view their daily trip allowance (*bata*), approved cash advances, and monthly driving incentives.
   - Dispatchers cannot view high-level company tax filings, loan EMI structures, or executive net profit margins.
3. **Multi-Tenant Data Isolation:**
   - Every database query strictly filters by `organization_id` enforced via PostgreSQL Row-Level Security (RLS). A user from Organization A cannot discover, query, or track any asset from Organization B under any circumstance.
4. **Sub-Contracted Owner Separation:**
   - In third-party vehicle attachments (market trucks attached to a transport company), the vehicle owner can see **only their specific vehicle's** live location, mileage, fuel logs, and trip payouts. They cannot view any other vehicles in the enterprise fleet.

---

## 4. End-to-End Operational Workflows

---

### Workflow 1: Driver-Lorry Dual-Handshake Assignment Workflow

This workflow eliminates assignment disputes by requiring formal mutual confirmation between dispatcher and driver.

```mermaid
sequenceDiagram
    autonumber
    actor Dispatcher as Fleet Dispatcher (Web)
    participant Core as Backend Assignment Engine
    participant DB as PostgreSQL Database
    actor Driver as Commercial Driver (Mobile App)
    participant Push as FCM / APNS Gateway

    Dispatcher->>Core: Select Vehicle (TN 09 AB 1234) & Driver (Murugan K)
    Core->>DB: Query Driver License Expiry & Vehicle Fitness/Insurance
    alt Compliance Verification Fails
        DB-->>Core: Vehicle Fitness Expired 2 days ago
        Core-->>Dispatcher: Assignment Blocked: "Vehicle FC expired"
    else Compliance Verification Passes
        Core->>DB: Check if Driver or Vehicle has uncompleted trip
        DB-->>Core: Both Resources Free
        Core->>DB: Create Assignment (Status: PENDING_CONFIRMATION)
        Core->>Push: Send High-Priority Interactive Push Notification
        Push->>Driver: "New Vehicle Assignment: TN 09 AB 1234. Tap to review."
        Driver->>Core: Opens App -> Views Lorry Profile (Model, Tyre Health, Notes)
        alt Driver Declines
            Driver->>Core: Tap "Decline" with Reason ("Vehicle clutch slipping")
            Core->>DB: Update Status to REJECTED + Log Reason
            Core-->>Dispatcher: Real-Time Alert: Driver declined assignment
        else Driver Accepts
            Driver->>Core: Tap "Accept Assignment"
            Core->>DB: Update Status to ACTIVE_ASSIGNED
            Core->>DB: Close any prior active assignment for this vehicle
            Core-->>Dispatcher: WebSocket Update: Assignment Active
            Driver-->>Driver: App Home Screen transitions to Assigned Lorry Dashboard
        end
    end
```

---

### Workflow 2: Commercial Trip Lifecycle (From Booking to Invoice)

```mermaid
flowchart TD
    Start(["1. Order Created by Customer / Dispatcher"]) --> Dispatch["2. Trip Assigned to Paired Lorry & Driver"]
    Dispatch --> PTI["3. Pre-Trip Inspection:<br/>Driver takes physical Odometer Photo"]
    PTI --> GeofenceOrigin{"4. Lorry exits Origin Geofence?"}
    
    GeofenceOrigin -- Yes --> InTransit["5. Status: IN_TRANSIT<br/>Continuous 10s Adaptive GPS Tracking"]
    GeofenceOrigin -- No --> WaitOrigin["Wait at Loading Bay"]
    WaitOrigin --> GeofenceOrigin
    
    InTransit --> StopCheck{"Halt Detected >30 mins?"}
    StopCheck -- Yes --> LogHalt["Log Halt Location & Query Driver"]
    StopCheck -- No --> TransitOK["Continue Transit"]
    
    LogHalt --> Waypoint["Transit Waypoints & Toll Gates"]
    TransitOK --> Waypoint
    
    Waypoint --> DestGeofence{"Enters Destination Geofence?"}
    DestGeofence -- Yes --> Unloading["6. Status: AT_DESTINATION<br/>Unloading Cargo"]
    DestGeofence -- No --> InTransit
    
    Unloading --> FinalOdo["7. Driver logs Final Odometer with Photo"]
    FinalOdo --> SignPOD["8. Consignee signs Digital POD on Driver Touchscreen"]
    SignPOD --> Audit["9. System compares Odometer Delta vs GPS Distance"]
    Audit --> Settle["10. Fuel & Expense Slips Audited"]
    Settle --> Invoice["11. GST Invoice Generated & Sent to Consignor"]
    Invoice --> End(["Trip Complete & Archived"])
```

---

### Workflow 3: Resilient Tracking Exception Handling

This workflow governs how the platform recovers gracefully when mobile connectivity drops, batteries run low, or drivers attempt to spoof locations.

```mermaid
flowchart TD
    Ping["Driver Phone Captures Geolocation Ping"] --> MockCheck{"Is Location Mocked?<br/>(isFromMockProvider == true)"}
    
    MockCheck -- Yes --> FlagFraud["Reject Ping & Alert Dispatcher:<br/>'GPS Spoofing Detected'"]
    MockCheck -- No --> PlausibleCheck{"Kinematic Plausibility Check:<br/>Speed < 120 km/h & Jump < 2km/10s?"}
    
    PlausibleCheck -- No --> FlagJump["Reject Ping & Flag Cellular Glitch"]
    PlausibleCheck -- Yes --> NetCheck{"Is 4G/5G Network Available?"}
    
    NetCheck -- No --> BufferLocal["Buffer to Device SQLite Storage<br/>(Store Timestamp, Lat, Lng, Battery, Speed)"]
    BufferLocal --> MonitorConn["Monitor Connectivity State in Background"]
    MonitorConn --> NetCheck
    
    NetCheck -- Yes --> SyncBatch["Send Compressed Batch to Server Gateway"]
    SyncBatch --> ServerIngest["Server Ingestion Pipeline (TimescaleDB)"]
    ServerIngest --> Broadcast["Broadcast to Fleet Owner Dashboard via WebSocket"]
    
    subgraph BatteryMonitor["Independent OS Service Monitor"]
        BatteryCheck{"Battery Level < 15%?"}
        BatteryCheck -- Yes --> LowBatAlert["Dispatch Warning to Fleet Manager:<br/>'Driver Phone Battery Low (12%)'"]
        
        KillCheck{"App Force-Closed or Killed by OS?"}
        KillCheck -- Yes --> RestartService["Android Sticky Foreground Service Restarts Automatically"]
    end
```

---

### Workflow 4: Fuel Expense Verification & Discrepancy Auditing

```mermaid
sequenceDiagram
    autonumber
    actor Driver as Commercial Driver
    participant App as Driver Mobile App
    participant OCR as Backend Receipt OCR Service
    participant Audit as Mileage Reconciliation Engine
    actor Acct as Fleet Accountant

    Driver->>App: Record Fuel Purchase (₹12,400, 130 Litres)
    Driver->>App: Take Photo of Fuel Dispenser Screen & Printed Bill
    App->>OCR: Upload Bill Image
    OCR->>OCR: Extract Date, Litres, Total Amount, Fuel Station Name
    OCR-->>App: Auto-Fill Form & Prompt Driver Confirmation
    Driver->>App: Confirm & Submit Fuel Record
    App->>Audit: Submit Record with Current Vehicle Odometer
    Audit->>Audit: Calculate Distance since last refuel ($\Delta \text{km}$)
    Audit->>Audit: Compute Real-World Economy: $\text{km/L} = \frac{\Delta \text{km}}{\text{Litres}}$
    alt Economy < Expected Range (e.g., 2.2 km/L vs standard 3.8 km/L)
        Audit-->>Acct: Flag Incident: "Potential Fuel Siphoning / Mileage Drop"
    else Economy Normal
        Audit-->>Acct: Add to Approved Expense Queue
    end
    Acct->>Acct: Verify OCR Image against Bank FASTag / Fuel Card statement
    Acct-->>Driver: Approve Fuel Expense (Credited to Trip P&L)
```

