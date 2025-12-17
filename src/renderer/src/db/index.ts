import { createRxDatabase, addRxPlugin } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema'
import {
  campaignSchema,
  combatEncounterSchema,
  combatantSchema,
  characterSchema,
  gameSystemTagSchema,
  npcSchema,
  sessionSchema
} from './schemas'

// Agregar plugin de update
addRxPlugin(RxDBUpdatePlugin)
// Agregar plugin de migración
addRxPlugin(RxDBMigrationSchemaPlugin)

const DB_NAME = 'dm_toolbox_db'

export type Database = any

let dbInstance: Database | null = null
let creationPromise: Promise<Database> | null = null

export const getDatabase = async (): Promise<Database> => {
  if (dbInstance) return dbInstance
  if (creationPromise) return creationPromise

  creationPromise = _createDatabaseInstance()

  try {
    dbInstance = await creationPromise
    return dbInstance
  } catch (error) {
    creationPromise = null
    throw error
  }
}

async function _createDatabaseInstance(): Promise<Database> {
  const db = await createRxDatabase({
    name: DB_NAME,
    storage: getRxStorageDexie(),
    multiInstance: false,
    eventReduce: true
  })

  await db.addCollections({
    campaigns: {
      schema: campaignSchema,
      migrationStrategies: {
        1: (oldDoc) => {
          oldDoc.backgroundImage = ''
          return oldDoc
        }
      }
    },
    combatEncounters: {
      schema: combatEncounterSchema
    },
    combatants: {
      schema: combatantSchema,
      migrationStrategies: {
        1: (oldDoc) => {
          oldDoc.type = 'npc'
          oldDoc.isHostile = false
          return oldDoc
        }
      }
    },
    characters: {
      schema: characterSchema
    },
    gameSystemTags: {
      schema: gameSystemTagSchema
    },
    npcs: {
      schema: npcSchema,
      migrationStrategies: {
        1: (oldDoc) => {
          oldDoc.type = 'npc'
          return oldDoc
        }
      }
    },
    sessions: {
      schema: sessionSchema
    }
  })

  return db
}
