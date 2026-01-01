# Guía de Flujo de Trabajo y Desarrollo

Este documento detalla el proceso estándar para desarrollar, integrar y desplegar cambios en DM Toolbox.

## 1. Configuración Inicial (Solo una vez)

Asegúrate de tener instaladas las extensiones recomendadas en VS Code:

- **Conventional Commits** (vivaxy)
- **GitHub Pull Requests and Issues** (GitHub)
- **GitLens** (GitKraken)
- **Error Lens** (Alexander)

## 2. Flujo de Desarrollo Diario

### Paso 1: Crear una Rama

Nunca trabajes directamente en `develop` o `master`.

1. Actualiza tu repositorio:
   ```bash
   git checkout develop
   git pull
   ```
2. Crea una rama descriptiva:
   ```bash
   git checkout -b tipo/nombre-tarea
   # Ejemplos:
   # git checkout -b feat/inventario-personajes
   # git checkout -b fix/calculo-iniciativa
   ```

### Paso 2: Programar y Commitear

1. Realiza tus cambios en el código.
2. Prepara los archivos (Stage) en la pestaña de Git.
3. **Haz el Commit:**
   - Usa la extensión **Conventional Commits** (`Cmd+Shift+P` -> `Conventional Commits`).
   - O hazlo manual siguiendo el formato: `tipo(alcance): descripción`.
   - _Nota:_ Si el mensaje es incorrecto, `husky` bloqueará el commit.
   - _Nota:_ `lint-staged` formateará tu código automáticamente antes de guardar.

### Paso 3: Subir y Crear Pull Request

1. Sube tu rama a GitHub:
   ```bash
   git push origin tipo/nombre-tarea
   ```
2. Crea el Pull Request (PR) desde la extensión de GitHub en VS Code.
   - Base: `develop`
   - Compare: `tipo/nombre-tarea`
3. Espera a que los checks (GitHub Actions) pasen (verde).
4. Haz Merge del PR y borra la rama remota.

## 3. Flujo de Release (Lanzamiento)

Cuando estés listo para publicar una nueva versión (ej: de 0.4.0 a 0.5.0):

1. **Preparar Master:**

   ```bash
   git checkout master
   git merge develop
   ```

2. **Generar Versión:**
   Este comando actualiza la versión, genera el changelog y crea el tag.

   ```bash
   pnpm run release
   ```

3. **Publicar:**

   ```bash
   git push --follow-tags origin master
   ```

   _Esto disparará automáticamente el build y subirá los instaladores a GitHub Releases._

4. **Sincronizar Develop:**
   ```bash
   git checkout develop
   git merge master
   git push origin develop
   ```

## Herramientas Integradas

- **Husky:** Ejecuta scripts antes de acciones de git (pre-commit, commit-msg).
- **Commitlint:** Verifica que tus mensajes de commit sigan el estándar.
- **Lint-Staged:** Ejecuta ESLint y Prettier solo en archivos modificados.
- **Standard-Version:** Automatiza el versionado y changelog.
- **GitHub Actions:** Valida PRs y construye releases automáticamente.
