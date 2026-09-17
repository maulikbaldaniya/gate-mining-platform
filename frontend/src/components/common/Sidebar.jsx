import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  FileCheck2,
  RotateCw,
  AlertTriangle,
  BookOpen,
  History,
  TrendingUp,
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/schedule', label: '120-Day Roadmap', icon: CalendarDays },
    { to: '/tests/weekly', label: 'Weekly Tests', icon: FileCheck2 },
    { to: '/revision', label: "Today's Revision", icon: RotateCw },
    { to: '/mistakes', label: 'Mistake Book', icon: AlertTriangle },
    { to: '/formulas', label: 'Formula Book', icon: BookOpen },
    { to: '/pyqs', label: 'GATE PYQs', icon: History },
    { to: '/progress', label: 'Syllabus & Analytics', icon: TrendingUp },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
