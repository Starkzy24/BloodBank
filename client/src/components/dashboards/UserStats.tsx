import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";

const BLOOD_TYPE_COLORS = {
  "A+": "#ef4444",
  "A-": "#f87171",
  "B+": "#3b82f6",
  "B-": "#60a5fa",
  "AB+": "#8b5cf6",
  "AB-": "#a78bfa",
  "O+": "#10b981",
  "O-": "#34d399"
};

const UserStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading user statistics
      </div>
    );
  }

  // Format data for pie charts
  const roleData = [
    { name: "Donors", value: data.byRole.donors },
    { name: "Patients", value: data.byRole.patients },
    { name: "Admins", value: data.byRole.admins }
  ];

  const bloodTypeData = Object.entries(data.donorsByBloodType).map(([type, count]) => ({
    name: type,
    value: count
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total}</div>
            <p className="text-xs text-muted-foreground">
              Registered users in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.byRole.donors}</div>
            <p className="text-xs text-muted-foreground">
              {((data.byRole.donors / data.total) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.byRole.patients}</div>
            <p className="text-xs text-muted-foreground">
              {((data.byRole.patients / data.total) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="role-distribution">
        <TabsList>
          <TabsTrigger value="role-distribution">Role Distribution</TabsTrigger>
          <TabsTrigger value="donor-blood-types">Donor Blood Types</TabsTrigger>
        </TabsList>
        <TabsContent value="role-distribution">
          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
              <CardDescription>
                Overview of all users by their roles
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            index === 0 ? "#3b82f6" : 
                            index === 1 ? "#f87171" : 
                            "#8b5cf6"
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {roleData.map((role) => (
                  <div key={role.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-4 w-4 rounded-full" 
                          style={{ 
                            backgroundColor: 
                              role.name === "Donors" ? "#3b82f6" : 
                              role.name === "Patients" ? "#f87171" : 
                              "#8b5cf6"
                          }}
                        />
                        <span className="text-sm font-medium">{role.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {role.value} ({((role.value / data.total) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={(role.value / data.total) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="donor-blood-types">
          <Card>
            <CardHeader>
              <CardTitle>Donor Blood Type Distribution</CardTitle>
              <CardDescription>
                Overview of donors by blood type
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bloodTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {bloodTypeData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.name}`} 
                          fill={BLOOD_TYPE_COLORS[entry.name] || "#888"} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {bloodTypeData.map((blood) => (
                  <div key={blood.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-4 w-4 rounded-full" 
                          style={{ backgroundColor: BLOOD_TYPE_COLORS[blood.name] || "#888" }}
                        />
                        <span className="text-sm font-medium">{blood.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {blood.value} ({((blood.value / data.byRole.donors) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={(blood.value / data.byRole.donors) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserStats;