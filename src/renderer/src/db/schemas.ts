export const campaignSchema = {
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    system: {
      type: 'string'
    },
    systemColor: {
      type: 'string',
      default: 'indigo'
    },
    createdAt: {
      type: 'number'
    },
    description: {
      type: 'string'
    },
    backgroundImage: {
      type: 'string',
      default: ''
    }
  },
  required: ['id', 'name', 'createdAt']
} as const

export const combatEncounterSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    campaignId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    round: {
      type: 'number',
      minimum: 1,
      default: 1
    },
    currentTurn: {
      type: 'number',
      minimum: 0,
      default: 0
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    createdAt: {
      type: 'number'
    },
    updatedAt: {
      type: 'number'
    }
  },
  required: ['id', 'campaignId', 'name', 'createdAt', 'isActive', 'updatedAt'],
  indexes: ['campaignId', 'isActive']
} as const

export const combatantSchema = {
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    encounterId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    initiative: {
      type: 'number',
      minimum: 0,
      maximum: 99
    },
    hp: {
      type: 'number',
      minimum: 0
    },
    maxHp: {
      type: 'number',
      minimum: 1
    },
    ac: {
      type: 'number',
      minimum: 0,
      default: 10
    },
    isNpc: {
      type: 'boolean',
      default: true
    },
    type: {
      type: 'string',
      default: 'npc'
    },
    isHostile: {
      type: 'boolean',
      default: false
    },
    attacks: {
      type: 'string',
      default: ''
    },
    imageData: {
      type: 'string',
      default: ''
    },
    conditions: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    notes: {
      type: 'string',
      default: ''
    }
  },
  required: ['id', 'encounterId', 'name', 'initiative', 'hp', 'maxHp'],
  indexes: ['encounterId']
} as const

export const characterSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    campaignId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    playerName: {
      type: 'string',
      default: ''
    },
    class: {
      type: 'string',
      default: ''
    },
    race: {
      type: 'string',
      default: ''
    },
    level: {
      type: 'number',
      minimum: 1,
      default: 1
    },
    maxHp: {
      type: 'number',
      minimum: 1,
      default: 10
    },
    ac: {
      type: 'number',
      minimum: 0,
      default: 10
    },
    initiativeBonus: {
      type: 'number',
      default: 0
    },
    isAlive: {
      type: 'boolean',
      default: true
    },
    imageData: {
      type: 'string',
      default: ''
    },
    notes: {
      type: 'string',
      default: ''
    },
    createdAt: {
      type: 'number'
    }
  },
  required: ['id', 'campaignId', 'name', 'createdAt'],
  indexes: ['campaignId']
} as const

export const gameSystemTagSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    color: {
      type: 'string',
      default: 'indigo'
    },
    createdAt: {
      type: 'number'
    }
  },
  required: ['id', 'name', 'createdAt'],
  indexes: ['name']
} as const

export const npcSchema = {
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    campaignId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    type: {
      type: 'string',
      default: 'npc'
    },
    race: {
      type: 'string',
      default: ''
    },
    role: {
      type: 'string',
      default: ''
    },
    hp: {
      type: 'number',
      minimum: 0,
      default: 10
    },
    ac: {
      type: 'number',
      minimum: 0,
      default: 10
    },
    attacks: {
      type: 'string',
      default: ''
    },
    imageData: {
      type: 'string',
      default: ''
    },
    notes: {
      type: 'string',
      default: ''
    },
    isHostile: {
      type: 'boolean',
      default: false
    },
    createdAt: {
      type: 'number'
    }
  },
  required: ['id', 'campaignId', 'name', 'createdAt'],
  indexes: ['campaignId']
} as const

export const sessionSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    campaignId: {
      type: 'string',
      maxLength: 100
    },
    title: {
      type: 'string'
    },
    sessionNumber: {
      type: 'number',
      minimum: 1,
      default: 1
    },
    date: {
      type: 'number'
    },
    notes: {
      type: 'string',
      default: ''
    },
    linkedCombatIds: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    linkedNpcIds: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    status: {
      type: 'string',
      enum: ['planned', 'completed', 'cancelled'],
      default: 'planned'
    },
    createdAt: {
      type: 'number'
    },
    updatedAt: {
      type: 'number'
    }
  },
  required: ['id', 'campaignId', 'title', 'date', 'createdAt', 'updatedAt'],
  indexes: ['campaignId', 'date']
} as const
