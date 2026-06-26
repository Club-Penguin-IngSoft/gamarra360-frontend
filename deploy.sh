#!/usr/bin/env bash
# deploy.sh — Despliegue del frontend Gamarra 360° en AWS Amplify
#
# Uso:
#   chmod +x deploy.sh
#   ./deploy.sh [rama]          # default: develop
#
# Prerrequisitos:
#   - AWS CLI instalado y configurado (aws configure)
#   - La app de Amplify ya conectada al repositorio en la consola de AWS
#
# Variables de entorno requeridas (o edita la sección de configuración):
#   AMPLIFY_APP_ID  — ID de la app en AWS Amplify (ej. d1abc23xyz)
#   AMPLIFY_BRANCH  — Rama conectada a Amplify (default: develop)

set -euo pipefail

# ── Configuración ──────────────────────────────────────────────────────────────
AMPLIFY_APP_ID="${AMPLIFY_APP_ID:-}"
AMPLIFY_BRANCH="${1:-${AMPLIFY_BRANCH:-develop}}"
BUILD_DIR="dist"

# ── Colores ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Validaciones ───────────────────────────────────────────────────────────────
command -v node &>/dev/null || error "Node.js no está instalado"
command -v npm  &>/dev/null || error "npm no está instalado"
command -v aws  &>/dev/null || error "AWS CLI no está instalado (pip install awscli)"
[ -z "$AMPLIFY_APP_ID" ]    && error "AMPLIFY_APP_ID no definido. Exporta la variable o edita el script."

# ── 1. Instalar dependencias ───────────────────────────────────────────────────
info "Instalando dependencias npm..."
npm ci --silent

# ── 2. Build de producción ────────────────────────────────────────────────────
info "Generando build de producción (Vite)..."
npm run build
[ -d "$BUILD_DIR" ] || error "Build falló: no se encontró el directorio $BUILD_DIR"

# ── 3. Verificar build ────────────────────────────────────────────────────────
BUNDLE_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
info "Build exitoso — tamaño total: $BUNDLE_SIZE"

# ── 4. Despliegue via AWS Amplify ─────────────────────────────────────────────
# Opción A: forzar re-deploy del último commit de la rama conectada
info "Disparando despliegue en Amplify (App: $AMPLIFY_APP_ID, Rama: $AMPLIFY_BRANCH)..."
JOB_ID=$(aws amplify start-job \
  --app-id "$AMPLIFY_APP_ID" \
  --branch-name "$AMPLIFY_BRANCH" \
  --job-type RELEASE \
  --query 'jobSummary.jobId' \
  --output text)

info "Job iniciado: $JOB_ID"

# ── 5. Esperar resultado ───────────────────────────────────────────────────────
info "Esperando resultado del deploy (puede tomar 2-5 min)..."
MAX_INTENTOS=30
INTERVALO=20

for i in $(seq 1 $MAX_INTENTOS); do
  STATUS=$(aws amplify get-job \
    --app-id "$AMPLIFY_APP_ID" \
    --branch-name "$AMPLIFY_BRANCH" \
    --job-id "$JOB_ID" \
    --query 'job.summary.status' \
    --output text 2>/dev/null || echo "PENDING")

  case "$STATUS" in
    SUCCEED)
      DOMAIN=$(aws amplify get-branch \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name "$AMPLIFY_BRANCH" \
        --query 'branch.displayName' \
        --output text 2>/dev/null || echo "$AMPLIFY_BRANCH")
      info "Deploy completado. URL: https://${AMPLIFY_BRANCH}.${AMPLIFY_APP_ID}.amplifyapp.com"
      exit 0
      ;;
    FAILED)
      error "Deploy fallido. Revisa los logs en la consola de Amplify (Job: $JOB_ID)"
      ;;
    CANCELLED)
      error "Deploy cancelado (Job: $JOB_ID)"
      ;;
    *)
      echo "  [$i/$MAX_INTENTOS] Estado: $STATUS — esperando ${INTERVALO}s..."
      sleep $INTERVALO
      ;;
  esac
done

warning "Tiempo de espera agotado. Revisa el estado en: https://console.aws.amazon.com/amplify"
