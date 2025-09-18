"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Database, Shield, Users, Settings } from "lucide-react"

interface TestResult {
  success: boolean
  tests: Record<string, boolean>
  message: string
}

export default function TestPage() {
  const { user, isLoaded } = useUser()
  const [databaseTests, setDatabaseTests] = useState<TestResult | null>(null)
  const [permissionTests, setPermissionTests] = useState<TestResult | null>(null)
  const [isTestingDatabase, setIsTestingDatabase] = useState(false)
  const [isTestingPermissions, setIsTestingPermissions] = useState(false)

  const runDatabaseTests = async () => {
    setIsTestingDatabase(true)
    try {
      const response = await fetch("/api/test/database")
      const result = await response.json()
      setDatabaseTests(result)
    } catch (error) {
      console.error("Database test failed:", error)
      setDatabaseTests({
        success: false,
        tests: {},
        message: "Failed to run database tests",
      })
    } finally {
      setIsTestingDatabase(false)
    }
  }

  const runPermissionTests = async () => {
    setIsTestingPermissions(true)
    try {
      const response = await fetch("/api/test/permissions")
      const result = await response.json()
      setPermissionTests(result)
    } catch (error) {
      console.error("Permission test failed:", error)
      setPermissionTests({
        success: false,
        tests: {},
        message: "Failed to run permission tests",
      })
    } finally {
      setIsTestingPermissions(false)
    }
  }

  const runAllTests = async () => {
    await runDatabaseTests()
    await runPermissionTests()
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to run integration tests</CardDescription>
            
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-balance mb-2">Integration Tests</h1>
          <p className="text-muted-foreground">Test the authentication and role management system</p>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <img
                src={user.imageUrl || "/placeholder.svg"}
                alt={user.fullName || ""}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
                <Badge variant="secondary">Clerk ID: {user.id}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Test Controls
            </CardTitle>
            <CardDescription>Run integration tests to verify system functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={runDatabaseTests} disabled={isTestingDatabase}>
                {isTestingDatabase ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Test Database
              </Button>
              <Button onClick={runPermissionTests} disabled={isTestingPermissions}>
                {isTestingPermissions ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Test Permissions
              </Button>
              <Button onClick={runAllTests} disabled={isTestingDatabase || isTestingPermissions} variant="outline">
                Run All Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Test Results */}
        {databaseTests && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Tests
                {databaseTests.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={databaseTests.success ? "border-green-200" : "border-red-200"}>
                <AlertDescription>{databaseTests.message}</AlertDescription>
              </Alert>
              <div className="mt-4 space-y-2">
                {Object.entries(databaseTests.tests).map(([testName, passed]) => (
                  <div key={testName} className="flex items-center justify-between p-2 border border-border rounded">
                    <span className="text-sm font-medium">
                      {testName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    {passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permission Test Results */}
        {permissionTests && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permission Tests
                {permissionTests.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={permissionTests.success ? "border-green-200" : "border-red-200"}>
                <AlertDescription>{permissionTests.message}</AlertDescription>
              </Alert>
              <div className="mt-4 space-y-2">
                {Object.entries(permissionTests.tests).map(([testName, passed]) => (
                  <div key={testName} className="flex items-center justify-between p-2 border border-border rounded">
                    <span className="text-sm font-medium">
                      {testName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    {passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>Overall system health and integration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 border border-border rounded">
                <span className="text-sm font-medium">Clerk Authentication</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded">
                <span className="text-sm font-medium">Database Connection</span>
                <Badge
                  variant="secondary"
                  className={
                    databaseTests?.tests.databaseConnection
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {databaseTests?.tests.databaseConnection ? "Connected" : "Unknown"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded">
                <span className="text-sm font-medium">User Sync</span>
                <Badge
                  variant="secondary"
                  className={
                    databaseTests?.tests.userSyncWorks ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }
                >
                  {databaseTests?.tests.userSyncWorks ? "Working" : "Unknown"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded">
                <span className="text-sm font-medium">Role System</span>
                <Badge
                  variant="secondary"
                  className={
                    permissionTests?.tests.permissionsRetrieved
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {permissionTests?.tests.permissionsRetrieved ? "Active" : "Unknown"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
