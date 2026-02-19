import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Permission } from '../../types/role';

interface PermissionTreeProps {
  permissions: Permission[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

interface TreeNode {
  resource: string;
  permissions: Permission[];
}

const PermissionTree: React.FC<PermissionTreeProps> = ({
  permissions,
  selectedIds,
  onSelectionChange,
}) => {
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

  // Group permissions by resource
  const tree = useMemo(() => {
    const grouped = new Map<string, Permission[]>();
    
    permissions.forEach((perm) => {
      const resource = perm.resource;
      if (!grouped.has(resource)) {
        grouped.set(resource, []);
      }
      grouped.get(resource)!.push(perm);
    });

    // Sort resources and their permissions
    return Array.from(grouped.entries())
      .map(([resource, perms]) => ({
        resource,
        permissions: perms.sort((a, b) => {
          const order = ['create', 'read', 'update', 'delete'];
          return order.indexOf(a.action) - order.indexOf(b.action);
        }),
      }))
      .sort((a, b) => a.resource.localeCompare(b.resource));
  }, [permissions]);

  const toggleResource = (resource: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource);
    } else {
      newExpanded.add(resource);
    }
    setExpandedResources(newExpanded);
  };

  const isResourceExpanded = (resource: string) => expandedResources.has(resource);

  const isResourceFullySelected = (node: TreeNode) => {
    return node.permissions.every((perm) => selectedIds.includes(perm.id));
  };

  const isResourcePartiallySelected = (node: TreeNode) => {
    const selected = node.permissions.filter((perm) => selectedIds.includes(perm.id));
    return selected.length > 0 && selected.length < node.permissions.length;
  };

  const handleResourceToggle = (node: TreeNode) => {
    const allSelected = isResourceFullySelected(node);
    const permIds = node.permissions.map((p) => p.id);
    
    if (allSelected) {
      // Deselect all
      onSelectionChange(selectedIds.filter((id) => !permIds.includes(id)));
    } else {
      // Select all
      const newIds = new Set([...selectedIds, ...permIds]);
      onSelectionChange(Array.from(newIds));
    }
  };

  const handlePermissionToggle = (permId: number) => {
    if (selectedIds.includes(permId)) {
      onSelectionChange(selectedIds.filter((id) => id !== permId));
    } else {
      onSelectionChange([...selectedIds, permId]);
    }
  };

  const formatResourceName = (resource: string) => {
    return resource
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatActionName = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  return (
    <div className="bg-slate-700 rounded-md border border-slate-600 max-h-96 overflow-y-auto">
      {tree.map((node) => {
        const isExpanded = isResourceExpanded(node.resource);
        const isFullySelected = isResourceFullySelected(node);
        const isPartiallySelected = isResourcePartiallySelected(node);

        return (
          <div key={node.resource} className="border-b border-slate-600 last:border-b-0">
            {/* Resource Header */}
            <div className="flex items-center px-3 py-2 hover:bg-slate-600 transition-colors">
              <button
                type="button"
                onClick={() => toggleResource(node.resource)}
                className="mr-2 text-slate-400 hover:text-slate-200"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  checked={isFullySelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={() => handleResourceToggle(node)}
                  className="mr-3 h-4 w-4 rounded border-slate-500 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm font-semibold text-slate-200">
                  {formatResourceName(node.resource)}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  ({node.permissions.length} permissions)
                </span>
              </div>
            </div>

            {/* Permissions List */}
            {isExpanded && (
              <div className="bg-slate-750 pl-10 pr-3 py-2 space-y-1.5">
                {node.permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center py-1.5 px-2 rounded hover:bg-slate-600 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(perm.id)}
                      onChange={() => handlePermissionToggle(perm.id)}
                      className="mr-3 h-3.5 w-3.5 rounded border-slate-500 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-slate-300">
                        {formatActionName(perm.action)}
                      </div>
                      {perm.description && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {perm.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PermissionTree;
