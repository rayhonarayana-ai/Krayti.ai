/**
 * Qarayti.ai — RBAC Permission Matrix Inspector
 */

import React, { useState } from 'react';
import { UserRole, ResourceDomain, PermissionAction } from '../../domain/types/auth.types';
import { rbacManager } from '../../core/auth/rbac.manager';
import { authService } from '../../core/auth/auth.service';
import { Shield, Check, X, User, Layers } from 'lucide-react';

export const RBACInspector: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const activeUser = authService.getCurrentUser();

  const handleSwitchRole = (role: UserRole) => {
    setSelectedRole(role);
    authService.setFoundationSession(role);
  };

  const roles = Object.values(UserRole);
  const resources = Object.values(ResourceDomain);
  const actions = Object.values(PermissionAction);

  return (
    <div className="space-y-6">
      {/* Role Selector Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 border-l-2 border-l-[#D4AF37]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-2xl font-serif italic text-[#EAE9E6]">Role-Based Access Control Matrix</h2>
            </div>
            <p className="text-xs font-mono text-[#8E9299] mt-1">
              Test and verify RBAC security rules for Qarayti.ai portals and modules.
            </p>
          </div>

          {/* Role Pills */}
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleSwitchRole(role)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition border ${
                  selectedRole === role
                    ? 'bg-[#D4AF37] text-[#0F1115] border-[#D4AF37] font-bold'
                    : 'bg-[#0F1115] text-[#8E9299] border-[#2D333D] hover:text-[#EAE9E6] hover:border-[#D4AF37]/50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Current User Session Preview */}
        {activeUser && (
          <div className="bg-[#0F1115] p-4 border border-[#2D333D] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-[#D4AF37]" />
              <div>
                <span className="text-[#EAE9E6] font-bold">{activeUser.fullName}</span>
                <span className="text-[#8E9299] ml-2">({activeUser.email})</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold uppercase tracking-wider">
              ROLE: {activeUser.role}
            </span>
          </div>
        )}
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-[#161920] border border-[#2D333D] overflow-hidden">
        <div className="p-4 border-b border-[#2D333D] bg-[#0F1115]">
          <h3 className="text-sm font-serif italic text-[#EAE9E6]">
            Permission Matrix for <span className="text-[#D4AF37] font-mono not-italic">{selectedRole}</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2D333D] bg-[#0F1115] text-[#8E9299] text-[11px] font-mono uppercase tracking-wider">
                <th className="p-3">Resource Domain</th>
                {actions.map((act) => (
                  <th key={act} className="p-3 text-center">
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D] text-xs">
              {resources.map((res) => (
                <tr key={res} className="hover:bg-[#1A1D23] transition">
                  <td className="p-3 font-mono font-bold text-[#EAE9E6] flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-[#8E9299]" />
                    <span>{res}</span>
                  </td>
                  {actions.map((act) => {
                    const hasAccess = rbacManager.hasPermission(selectedRole, res, act);
                    return (
                      <td key={act} className="p-3 text-center">
                        {hasAccess ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-[#0F1115] text-[#2D333D]">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
