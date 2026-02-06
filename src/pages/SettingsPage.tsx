import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShieldCheck, Paintbrush, Link2, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackNotifications: true,
    criticalOnly: false,
    twoFactor: true,
    sessionTimeout: true,
    apiRotation: false,
    darkMode: true,
    compactView: false,
    animations: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsSections = [
    {
      title: 'Notifications',
      icon: Bell,
      color: 'from-blue-500/20 to-cyan-500/10',
      iconColor: 'text-blue-400',
      settings: [
        { key: 'emailNotifications', label: 'Email notifications', description: 'Receive updates via email' },
        { key: 'slackNotifications', label: 'Slack notifications', description: 'Get alerts in Slack' },
        { key: 'criticalOnly', label: 'Critical alerts only', description: 'Only notify for critical issues' },
      ],
    },
    {
      title: 'Security',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
      settings: [
        { key: 'twoFactor', label: 'Two-factor authentication', description: 'Add extra security layer' },
        { key: 'sessionTimeout', label: 'Session timeout (30 min)', description: 'Auto logout after inactivity' },
        { key: 'apiRotation', label: 'API key rotation', description: 'Rotate keys automatically' },
      ],
    },
    {
      title: 'Appearance',
      icon: Paintbrush,
      color: 'from-purple-500/20 to-violet-500/10',
      iconColor: 'text-purple-400',
      settings: [
        { key: 'darkMode', label: 'Dark mode', description: 'Use dark theme' },
        { key: 'compactView', label: 'Compact view', description: 'Show more data per screen' },
        { key: 'animations', label: 'Animations', description: 'Enable UI animations' },
      ],
    },
  ];

  const integrations = [
    { name: 'GitHub', status: 'connected', icon: '🔗' },
    { name: 'Slack', status: 'connected', icon: '💬' },
    { name: 'Jira', status: 'connected', icon: '📋' },
  ];

  return (
    <div className="p-8 min-h-full">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400">Configure your ErrorIQ preferences</p>
      </motion.div>

      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              className="relative overflow-hidden rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#111114] to-[#0c0c0f]" />
              <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
              
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn(
                    'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center border',
                    section.color,
                    `border-${section.iconColor.replace('text-', '')}/20`
                  )}>
                    <Icon className={cn('w-5 h-5', section.iconColor)} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                </div>

                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0"
                    >
                      <div>
                        <p className="text-white font-medium">{setting.label}</p>
                        <p className="text-sm text-zinc-500">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => toggleSetting(setting.key as keyof typeof settings)}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-all duration-200',
                          settings[setting.key as keyof typeof settings]
                            ? 'bg-gradient-to-r from-purple-500 to-violet-500'
                            : 'bg-zinc-700'
                        )}
                      >
                        <motion.span
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
                          animate={{
                            left: settings[setting.key as keyof typeof settings] ? '1.5rem' : '0.25rem'
                          }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Integrations */}
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#111114] to-[#0c0c0f]" />
          <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
          
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Integrations</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {integrations.map((integration, i) => (
                <motion.div
                  key={integration.name}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{integration.icon}</span>
                    <span className="text-white font-medium">{integration.name}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Connected
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
