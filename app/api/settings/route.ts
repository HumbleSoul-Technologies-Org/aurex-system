import { NextResponse } from 'next/server'
import { getSystemSettings, updateSystemSettings, createDefaultSystemSettings, initializeSystemSettings } from '@/lib/services/settings'
import { SystemSettings } from '@/lib/local-store'

export async function GET() {
  try {
    let settings = getSystemSettings()
    if (!settings) {
      settings = initializeSystemSettings()
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Create new settings if none exist
    const newSettings: SystemSettings = {
      id: body.id || `settings-${Date.now()}`,
      version: body.version || '2.0.0',
      companyInfo: body.companyInfo || {},
      propertyTypeDefaults: body.propertyTypeDefaults || {},
      tenantTypeConfigurations: body.tenantTypeConfigurations || {},
      complianceSettings: body.complianceSettings || {},
      notifications: body.notifications || {},
      tenantPortalSettings: body.tenantPortalSettings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMigrationDate: new Date().toISOString(),
    }

    const created = createDefaultSystemSettings()
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating system settings:', error)
    return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const updated = updateSystemSettings({
      ...body,
      updatedAt: new Date().toISOString(),
    })

    if (!updated) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating system settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    // Reset to defaults by recreating
    const resetSettings = createDefaultSystemSettings()
    return NextResponse.json({ message: 'Settings reset to defaults', settings: resetSettings })
  } catch (error) {
    console.error('Error resetting system settings:', error)
    return NextResponse.json({ error: 'Failed to reset settings' }, { status: 500 })
  }
}