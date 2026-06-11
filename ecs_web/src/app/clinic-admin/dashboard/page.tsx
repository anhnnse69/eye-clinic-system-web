"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  Briefcase,
  Pill,
  DoorOpen,
  Building2,
} from "lucide-react"

import {
  clinicDashboardService,
  ClinicDashboardResponse,
} from "@/services/clinic-dashboard.service"

import { formatCurrency } from "@/lib/utils"

export default function ClinicAdminDashboard() {
  const [dashboard, setDashboard] =
    useState<ClinicDashboardResponse | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)


     const response =
  await clinicDashboardService.get()

  if (!response.data) {
    setError("Không có dữ liệu dashboard")
    return
  }

setDashboard(response.data)
    } catch (err: any) {
      setError(
        err?.response?.data?.code ||
        err?.message ||
        "Không thể tải dashboard"
      )
    } finally {
      setLoading(false)
    }


  }

  if (loading) {
    return (<div className="p-6">
      Đang tải dữ liệu... </div>
    )
  }

  if (error) {
    return (<div className="p-6 text-red-500">
      {error} </div>
    )
  }

  return (<div className="space-y-6"> <h1 className="text-2xl font-bold">
    Dashboard Phòng Khám </h1>


    {/* KPI */}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      <DashboardCard
        title="Lịch hẹn hôm nay"
        value={dashboard?.totalAppointments ?? 0}
        icon={<Calendar />}
      />

      <DashboardCard
        title="Hoàn thành"
        value={dashboard?.completedAppointments ?? 0}
        icon={<CheckCircle />}
      />

      <DashboardCard
        title="Đang chờ"
        value={dashboard?.pendingAppointments ?? 0}
        icon={<Users />}
      />

      <DashboardCard
        title="Doanh thu"
        value={formatCurrency(
          dashboard?.totalRevenue ?? 0
        )}
        icon={<TrendingUp />}
      />
    </div>

    {/* Clinic Overview */}

    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">
        Tổng quan phòng khám
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        <OverviewCard
          title="Bác sĩ"
          value={dashboard?.totalDoctors ?? 0}
          icon={<Building2 />}
        />

        <OverviewCard
          title="Nhân viên"
          value={dashboard?.totalStaffs ?? 0}
          icon={<Users />}
        />

        <OverviewCard
          title="Dịch vụ"
          value={dashboard?.totalServices ?? 0}
          icon={<Briefcase />}
        />

        <OverviewCard
          title="Phòng"
          value={dashboard?.totalRooms ?? 0}
          icon={<DoorOpen />}
        />

        <OverviewCard
          title="Thuốc"
          value={dashboard?.totalMedicines ?? 0}
          icon={<Pill />}
        />
      </div>
    </div>

    {/* Weekly Statistics */}

    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">
        Thống kê 7 ngày gần nhất
      </h2>

      <div className="space-y-3">
        {dashboard?.weeklyStatistics?.map(
          (item) => (
            <div
              key={item.date}
              className="flex justify-between items-center border rounded-lg p-3"
            >
              <div>
                <p className="font-medium">
                  {item.date}
                </p>

                <p className="text-sm text-gray-500">
                  {item.appointments} lịch hẹn
                </p>
              </div>

              <div className="font-semibold">
                {formatCurrency(item.revenue)}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  </div>


  )
}

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
}) {
  return (<div className="bg-white border rounded-xl p-4"> <div className="flex justify-between"> <div> <p className="text-gray-500 text-sm">
    {title} </p>

    <p className="text-2xl font-bold mt-2">
      {value}
    </p>
  </div>
    {icon}
  </div>
  </div>

  )
}

function OverviewCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (<div className="border rounded-lg p-4 text-center"> <div className="flex justify-center mb-2">{icon} 
  </div>
    <p className="text-gray-500 text-sm">
      {title}
    </p>

    <p className="text-xl font-bold">
      {value}
    </p>
  </div>


  )
}
