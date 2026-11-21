export const mockDashboard = {
  totalAmbulances: 27,
  availableAmbulances: 9,
  enRoute: 18,
  criticalZones: 0,
  activeIncidents: 0,

  fleetStatus: [
    { name: "Available", value: 9 },
    { name: "Moving", value: 18 },
    { name: "Maintenance", value: 0 },
  ],

  riskDistribution: [
    { name: "Critical", value: 0 },
    { name: "High", value: 0 },
    { name: "Medium", value: 0 },
    { name: "Low", value: 0 },
  ],
};