import dayjs from 'dayjs'

export const getPriorityLabel = (priority?: number) => {
  switch (priority) {
    case 3:
      return '极高'
    case 2:
      return '紧急'
    default:
      return '常规'
  }
}

export const getPriorityTone = (priority?: number) => {
  switch (priority) {
    case 3:
      return 'priority-critical'
    case 2:
      return 'priority-urgent'
    default:
      return 'priority-normal'
  }
}

export const formatDueLabel = (dueTime?: string | null) => {
  if (!dueTime) {
    return '未设置截止时间'
  }

  const due = dayjs(dueTime)
  const now = dayjs()
  const diffHours = due.diff(now, 'hour', true)

  if (diffHours < 0) {
    return `已逾期 ${Math.ceil(Math.abs(diffHours))} 小时`
  }

  if (diffHours <= 24) {
    return `${Math.max(1, Math.floor(diffHours))} 小时内到期`
  }

  if (diffHours <= 72) {
    return `${Math.ceil(diffHours / 24)} 天内到期`
  }

  return `截止于 ${due.format('MM-DD HH:mm')}`
}

export const getDueTone = (dueTime?: string | null) => {
  if (!dueTime) {
    return 'due-neutral'
  }

  const due = dayjs(dueTime)
  const now = dayjs()
  const diffHours = due.diff(now, 'hour', true)

  if (diffHours < 0) {
    return 'due-overdue'
  }

  if (diffHours <= 24) {
    return 'due-soon'
  }

  return 'due-safe'
}

export const formatExactTime = (value?: string | null, format = 'MM-DD HH:mm') => {
  if (!value) {
    return '未设置'
  }

  return dayjs(value).format(format)
}

export const formatRelativeTime = (value?: string | null) => {
  if (!value) {
    return '刚刚'
  }

  const now = dayjs()
  const target = dayjs(value)
  const diffMinutes = now.diff(target, 'minute')

  if (diffMinutes < 1) {
    return '刚刚'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`
  }

  const diffHours = now.diff(target, 'hour')
  if (diffHours < 24) {
    return `${diffHours} 小时前`
  }

  const diffDays = now.diff(target, 'day')
  if (diffDays < 7) {
    return `${diffDays} 天前`
  }

  return target.format('MM-DD HH:mm')
}

export const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'owner':
      return '创建者'
    case 'admin':
      return '管理员'
    default:
      return '成员'
  }
}

export const getActionLabel = (actionType?: string) => {
  switch ((actionType || '').toUpperCase()) {
    case 'CREATE':
      return '创建'
    case 'MOVE':
      return '流转'
    case 'DELETE':
      return '删除'
    case 'COMMENT':
      return '评论'
    case 'UPDATE':
      return '更新'
    default:
      return '协作'
  }
}

export const getActionTone = (actionType?: string) => {
  switch ((actionType || '').toUpperCase()) {
    case 'CREATE':
      return 'tone-create'
    case 'MOVE':
      return 'tone-move'
    case 'DELETE':
      return 'tone-delete'
    case 'COMMENT':
      return 'tone-comment'
    default:
      return 'tone-update'
  }
}

export const getInitials = (value?: string | null) => {
  if (!value) {
    return 'TS'
  }

  return value.trim().slice(0, 2).toUpperCase()
}

export const getAccentColor = (seed = 0) => {
  const colors = ['#4f7dff', '#7f98d8', '#d8a24d', '#db6c7a', '#9bb6ff', '#70a2ff']
  return colors[Math.abs(seed) % colors.length]
}

export const clampPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(value)))
}
