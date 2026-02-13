export const NotificationType = {
    SMS: 'SMS',
    EMAIL: 'EMAIL'
  } as const;
  
  export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType];
  
  export const ThrottlingLevel = {
    NONE: 'NONE',
    SOFT: 'SOFT',
    HARD: 'HARD'
  } as const;
  
  export type ThrottlingLevelValue = typeof ThrottlingLevel[keyof typeof ThrottlingLevel];
  
  export const ThrottleMode = {
    SOFT: 'SOFT',
    HARD: 'HARD'
  } as const;
  
  export type ThrottleModeValue = typeof ThrottleMode[keyof typeof ThrottleMode];
  
  export const NotificationStatus = {
    SENT: 'SENT',
    FAILED: 'FAILED',
    RATE_LIMITED: 'RATE_LIMITED',
    PENDING: 'PENDING'
  } as const;
  
  export type NotificationStatusValue = typeof NotificationStatus[keyof typeof NotificationStatus];
  
  export const LimitType = {
    WINDOW: 'WINDOW',
    MONTHLY: 'MONTHLY',
    SYSTEM_WIDE: 'SYSTEM_WIDE'
  } as const;
  
  export type LimitTypeValue = typeof LimitType[keyof typeof LimitType];