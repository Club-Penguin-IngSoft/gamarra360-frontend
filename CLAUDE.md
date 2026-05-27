# CLAUDE.md — Proyecto Gamarra 360° (Club Penguin)

> Archivo de contexto para Claude Code. Describe qué es el proyecto, su arquitectura, convenciones de código y plan de construcción. Léelo completo antes de generar o modificar código.

---

## 1. Qué es este proyecto

**Gamarra 360°** es una plataforma de e-commerce tipo **marketplace multi-tenant** para digitalizar la oferta comercial del emporio de Gamarra. Múltiples vendedores (comerciantes) publican productos y gestionan sus ventas; los clientes exploran un catálogo diverso, solicitan cotizaciones, piden personalizaciones y compran, todo desde una única infraestructura.

Es un proyecto académico de la **PUCP** (curso de Ingeniería de Software, profesor Luis Flores que actúa como Product Owner). Equipo: **Club Penguin**, 10 integrantes. Coordinadora: Ariana Burga.

**Funcionalidades diferenciadoras** (no es un e-commerce estándar):
- Personalización de productos (estampados, diseños, variantes de talla/color)
- Negociación mediante cotizaciones (no solo compra directa)
- Descuentos por volumen / reglas de descuento
- Modelo multi-tenant con aislamiento de datos entre comerciantes

**Restricción importante del curso:** No se permite usar plantillas ni soluciones de e-commerce preconstruidas (tipo Shopify, WooCommerce). La lógica de negocio (catálogo, carrito, checkout, backoffice, cotizaciones, personalización) debe implementarse desde cero. Sí se permiten frameworks y librerías de propósito general.

---

## 2. Stack tecnológico

### Backend — API REST
- **Java 17** + **Spring Boot** (framework principal)
- **Spring Security** + **JWT (JJWT)** para autenticación y RBAC
- **Spring Data JPA** + **Hibernate** (acceso a datos, patrón Repositorio)
- **Maven** (gestión de dependencias y build)
- **Spring Mail + @Async** (envío asíncrono de correos)
- **Stripe Java SDK** (pasarela de pagos)

### Frontend — SPA
- **React** + **TypeScript**
- **Vite** (bundler y dev server)
- **React Router** (enrutamiento del lado del cliente)
- **Axios** (cliente HTTP hacia el backend)
- **Tailwind CSS** (estilos)
- Estado global con **Context API** (o Redux)

### Persistencia
- **MySQL** (BD relacional principal)
- **AWS S3 / MinIO** (almacenamiento de objetos: imágenes de productos, diseños de personalización)

### Infraestructura
- **Docker / Docker Compose** (entorno local)
- **Git / GitHub** (control de versiones)
- **Postman** (pruebas manuales de endpoints)
- **Despliegue:** AWS Amplify (frontend), AWS EC2 (backend), AWS RDS MySQL (principal + réplica), AWS S3 (archivos), NGINX (proxy reverso), AWS WAF (firewall)

---

## 3. Arquitectura

**Estilo: Monolito Modular por Capas** (NO microservicios).

Razones de la decisión: simplicidad de desarrollo y despliegue para los plazos del curso, consistencia transaccional ACID en una única BD, modularidad lógica que permite desarrollo en paralelo, y sin latencia de red entre módulos.

### Tres capas

1. **Capa de Presentación:** `@RestController`. Solo reciben HTTP, deserializan JSON, delegan al servicio y serializan la respuesta. SIN lógica de negocio.
2. **Capa de Negocio (Dominio):** `@Service` (Spring Beans). Concentran toda la lógica. Los controladores siempre delegan aquí.
3. **Capa de Datos:** `@Repository` (Spring Data JPA) + MySQL + S3. Ningún controlador accede directo a la BD; toda persistencia pasa por la capa de negocio.

### Módulos funcionales (por épica del backlog)

| Módulo | Responsabilidad | Entidades principales |
|---|---|---|
| `usuario` | Gestión de usuarios y perfiles | Usuario, Cliente, Vendedor/Comerciante, Admin, Direccion |
| `autenticacion` | Login, seguridad, JWT | Usuario |
| `catalogo` | Productos, variantes, categorías | Producto, VarianteProducto, Categoria, ReglaDescuento |
| `carrito` | Gestión temporal de compras | Carrito, ItemCarrito, ItemPersonalizado |
| `cotizacion` | Solicitudes y negociaciones | SolicitudCotizacion, Cotizacion, Mensaje, RespuestaSolicitud, DescuentoVolumen |
| `personalizacion` | Solicitudes de diseño personalizado | PeticionPersonalizacion, Personalizacion |
| `pedido` | Compras confirmadas | Pedido, DetallePedido, LineaPublico |
| `pago` | Procesamiento de pagos | OrdenPago, Pago, Transaccion |

### Reglas arquitectónicas críticas

- **Multi-tenancy (RNF-7):** Aislamiento de datos por vendedor mediante columna `vendedor_id` (o `tenant_id`) en todas las entidades asociadas a un comercio. Todos los repositorios JPA filtran automáticamente por este campo. Un vendedor nunca debe ver ni modificar datos de otro.
- **Seguridad (RNF-1, 2, 3):** Spring Security 6 + JWT. Cada token contiene `user_id`, `role`, `tenant_id`. Filtro `JwtAuthenticationFilter` intercepta todas las peticiones. Endpoints protegidos con `@PreAuthorize("hasRole('VENDEDOR')")`, etc.
- **Transaccionalidad:** Operaciones críticas (confirmar pedido = crear pedido + descontar stock + registrar pago) usan `@Transactional`. Si algún paso falla, rollback completo (ACID de MySQL).
- **Asincronismo:** Envío de correos con `@Async` (patrón fire-and-forget). El registro no espera la confirmación del correo.
- **Integración con Stripe:** Patrón Facade. El módulo de pagos aísla al resto del sistema de los detalles del SDK de Stripe (autenticación, Payment Intent, manejo de errores).
- **Stateless:** El backend no guarda sesión en memoria (toda la sesión va en el JWT), para permitir escalabilidad horizontal futura (RNF-6).

---

## 4. Convenciones de código (OBLIGATORIAS)

### Backend — Java / Spring Boot

Sufijos obligatorios por tipo de clase:

| Tipo | Convención | Ejemplo |
|---|---|---|
| Entidad JPA | PascalCase | `SolicitudCotizacion`, `VarianteProducto` |
| Interfaz de servicio | PascalCase + `Service` | `CotizacionService`, `PedidoService` |
| Implementación de servicio | + `ServiceImpl` | `CotizacionServiceImpl` |
| Repositorio JPA | + `Repository` | `ProductoRepository` |
| Controlador REST | + `Controller` | `PedidoController` |
| DTO | + `Dto` | `PedidoDto`, `CotizacionDto` |
| Mapper | + `Mapper` | `PedidoMapper` |
| Excepción | + `Exception` | `RecursoNoEncontradoException` |

- **Variables y métodos:** camelCase (`calcularDescuento()`, `idComercianteTenant`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_REINTENTOS_PAGO`, `DIAS_EXPIRACION_COTIZACION`)
- **Enums:** Tipo en PascalCase, valores en UPPER_SNAKE_CASE
- **Indentación:** 4 espacios. Llaves de apertura en la misma línea (estilo K&R). Línea en blanco entre métodos.
- **Nombres de variables:** no superar 20 caracteres; abreviar solo si sigue siendo descriptivo.

Enums clave:
```java
public enum EstadoPedido {
    PENDIENTE, CONFIRMADO, EN_PROCESO, ENVIADO, ENTREGADO, CANCELADO
}
public enum EstadoCotizacion {
    SOLICITADA, RESPONDIDA, CON_OBSERVACION, ACEPTADA, CANCELADA, EXPIRADA
}
```

### Frontend — React + TypeScript

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componente React | PascalCase + `.tsx` | `FormularioCotizacion.tsx` |
| Hook personalizado | `use` + PascalCase + `.ts` | `usePedido.ts`, `useAuth.ts` |
| Servicio de API | camelCase + `Service` + `.ts` | `pedidoService.ts` |
| Interfaz TypeScript | `I` + PascalCase | `IPedido`, `IProducto` |
| Variables/funciones | camelCase | `handleSubmitCotizacion` |
| Constantes globales | UPPER_SNAKE_CASE en `constants.ts` | `API_BASE_URL`, `TOKEN_KEY` |

- **Indentación:** 2 espacios (Prettier con `tabWidth: 2`)
- El frontend NUNCA contiene lógica de negocio. Validaciones de cliente solo de formato (UX), nunca reemplazan las del servidor.
- La lógica de llamadas a la API reside en hooks personalizados, no en los componentes.

### Base de datos

| Elemento | Convención | Ejemplo |
|---|---|---|
| Tablas | snake_case plural | `solicitudes_cotizacion`, `variantes_producto` |
| Columnas | snake_case | `id_comerciante`, `precio_base`, `fecha_creacion` |
| Claves primarias | `id_` + entidad | `id_pedido`, `id_producto` |
| Claves foráneas | `id_` + tabla referenciada (singular) | `id_comerciante` |
| Tablas N:M | entidadA_entidadB | `pedido_producto`, `usuario_rol` |
| Valores de enum en BD | UPPER_SNAKE_CASE | `EN_PROCESO`, `CON_OBSERVACION` |

### Estructura de paquetes — Backend

Cada módulo es autónomo: contiene su propio controller, service, repository, entity, dto y mapper.

```
com.gamarra360
├── config/         # CorsConfig, SecurityConfig, TenantConfig
├── exception/      # Excepciones personalizadas + GlobalExceptionHandler
├── shared/         # Utilidades transversales
│
├── catalogo/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── dto/
│   └── mapper/
├── pedido/         # (misma estructura interna)
├── cotizacion/
├── personalizacion/
├── usuario/
└── pago/
```

**Regla crítica:** La comunicación entre módulos es SOLO a través de interfaces de servicio, nunca accediendo al repositorio de otro módulo.

```java
// CORRECTO: cotizacion usa el servicio de pedido vía interfaz
@Service
public class CotizacionServiceImpl implements CotizacionService {
    private final PedidoService pedidoService; // inyección por constructor
    public void convertirAPedido(Long idCotizacion) {
        pedidoService.registrarDesdeCotizacion(idCotizacion);
    }
}

// INCORRECTO: acceder directo al repositorio de otro módulo
public class CotizacionServiceImpl {
    private final PedidoRepository pedidoRepository; // viola los límites del módulo
}
```

### Estructura de carpetas — Frontend

```
src/
├── assets/         # Imágenes, iconos, fuentes
├── components/     # Componentes reutilizables globales
├── hooks/          # useAuth, usePedido, useCotizacion
├── pages/          # CatalogoPage, PedidoPage, CotizacionPage
├── services/       # pedidoService.ts, catalogoService.ts (Axios)
├── store/          # Context API / Redux
├── types/          # IPedido, IProducto, ICotizacion
├── utils/          # formatearPrecio.ts, validarEmail.ts
├── constants/      # API_BASE_URL, TOKEN_KEY, RUTAS
└── router/         # Rutas y rutas protegidas por rol
```

---

## 5. Estándares de API REST

- Rutas: `/api/v1/{recurso}` en plural con kebab-case
  - `/api/v1/solicitudes-cotizacion`, `/api/v1/variantes-producto`, `/api/v1/reglas-descuento`
- Métodos HTTP semánticos: GET (leer), POST (crear, retorna 201), PUT (actualización completa), PATCH (parcial), DELETE (eliminar)
- Todo el intercambio es JSON. Sin motores de plantilla del lado del servidor (sin Thymeleaf, sin JSP).
- CORS configurado globalmente en `CorsConfig.java`, restringido al dominio del frontend. NUNCA `@CrossOrigin("*")` en producción.

### Manejo de excepciones

`@RestControllerAdvice` global (`GlobalExceptionHandler`) en `exception/`. Ningún stack trace se expone al cliente.

| Excepción | HTTP | Mensaje |
|---|---|---|
| `RecursoNoEncontradoException` | 404 | El recurso solicitado no fue encontrado |
| `CotizacionExpiradaException` | 409 | La cotización ha expirado |
| `PagoRechazadoException` | 402 | El pago no pudo procesarse |
| `AccesoNoAutorizadoException` | 403 | No tienes permisos para esta acción |
| `DatosInvalidosException` | 400 | La información ingresada no es válida |
| `TiempoDeEsperaException` | 408 | La solicitud está tardando más de lo esperado |
| Cualquier otra | 500 | Ha ocurrido un error inesperado |

Toda excepción se registra en log (SLF4J + Logback) antes de responder. Formato de error uniforme:
```json
{
  "timestamp": "2026-04-26T14:00:00",
  "status": 404,
  "error": "Recurso no encontrado",
  "mensaje": "El recurso solicitado no fue encontrado.",
  "ruta": "/api/v1/pedidos/99"
}
```

En el frontend (Axios interceptors): 401 → redirigir a login y limpiar token; 403 → toast de permisos; 404/400/500 → toast con el campo `mensaje`.

---

## 6. Patrones de diseño aplicados

| Categoría | Patrón | Uso en Gamarra 360° |
|---|---|---|
| Creacional | Singleton | `GestorConexionTenant` (contexto del tenant activo) |
| Creacional | Builder | Construcción de `Pedido` (desde compra directa, cotización o personalización) |
| Estructural | Adapter | Integración de pasarela de pago (aísla del SDK externo) |
| Estructural | Facade | `CotizacionFacade`, módulo de pagos (Stripe) |
| Estructural | Proxy | Carga diferida de `ImagenProducto` |
| Comportamiento | State | `EstadoPedido` y `EstadoCotizacion` (transiciones válidas) |
| Comportamiento | Observer | Notificaciones por cambio de estado |
| Comportamiento | Chain of Responsibility | Evaluación de `ReglaDescuento` |
| Persistencia | Repository, Data Mapper, Identity Field, FK Mapping, Class Table Inheritance | Capa de datos |
| Web | Front Controller (DispatcherServlet), Template View (componentes React) | Estructura web |

---

## 7. Control de versiones (Git Flow)

| Rama | Propósito |
|---|---|
| `main` | Producción (AWS). Protegida contra push directo. |
| `develop` | Integración continua del equipo. |
| `feature/[nombre]` | Desarrollo por funcionalidad. Ej: `feature/flujo-cotizacion` |
| `hotfix/[descripcion]` | Correcciones urgentes sobre main. |

- Commits: formato `[módulo]: descripción en imperativo`. Ej: `cotizacion: agregar validación de fecha límite`
- Todo cambio a develop/main pasa por Pull Request con revisión de al menos un compañero.
- Credenciales (`application.properties`) en `.gitignore`, gestionadas como variables de entorno en AWS.
- El código comentado se elimina antes de merge a develop.
- Código incompleto: `// TODO: descripción - Responsable`

---

## 8. Pruebas

- **Backend:** JUnit 5 + Mockito para la capa de servicio. Mocks para dependencias externas. Cobertura mínima 70% (JaCoCo).
- Nombres de pruebas: patrón `debeHacerX_cuandoY`. Ej: `debeAplicarDescuento_cuandoCantidadSuperaUmbralDefinido()`
- **Frontend:** React Testing Library para formulario de cotización, carrito y login.

Casos de prueba obligatorios:
- Cálculo de precios con ReglaDescuento (descuentos por volumen)
- Transiciones de estado válidas/inválidas de EstadoPedido y EstadoCotizacion
- Validación de registro (formato de correo y contraseña)
- Conversión de SolicitudCotizacion a Pedido cuando estado es ACEPTADA
- Expiración automática de cotizaciones por fecha límite
- Aislamiento de datos entre tenants (un comerciante no accede a datos de otro)

---

## 9. Alcance del producto

**8 Épicas, 44 Historias de Usuario, 64 Requisitos Funcionales, 14 Requisitos No Funcionales.**

### Épicas

| Épica | Título |
|---|---|
| EP-1 | Navegación y Exploración |
| EP-2 | Gestión de usuarios y permisos |
| EP-3 | Gestión de catálogo |
| EP-4 | Gestión de cotizaciones |
| EP-5 | Gestión de personalización de productos |
| EP-6 | Gestión de ventas y pedidos |
| EP-7 | Gestión operativa (Backoffice) |
| EP-8 | Auditoría y registro de eventos |

### Requisitos No Funcionales

| RNF | Título | Prioridad |
|---|---|---|
| RNF-1 | Autenticación segura | Must |
| RNF-2 | Control de acceso (RBAC) | Must |
| RNF-3 | Protección de datos | Must |
| RNF-5 | Manejo de concurrencia | Must |
| RNF-6 | Escalabilidad horizontal | Could |
| RNF-7 | Soporte multi-tenant | Must |
| RNF-8 | Disponibilidad del sistema | Must |
| RNF-9 | Recuperación ante fallos | Must |
| RNF-10 | Log de errores | Should |
| RNF-11 | Facilidad de uso | Could |
| RNF-12 | Interfaz responsiva | Must |
| RNF-13 | Facilidad de mantenimiento | Must |
| RNF-14 | Integración con servicios externos | Must |

### Roles del sistema

- **Cliente:** navega, compra, solicita cotizaciones y personalizaciones
- **Comerciante (Vendedor):** gestiona productos, responde cotizaciones, gestiona pedidos y reportes
- **Administrador:** verifica comerciantes, gestiona usuarios, accede a logs de auditoría

---

## 10. Plan de construcción (3 Sprints)

### Sprint 1 — Funcionalidades Básicas y Accesos
Objetivo: registro, login, logout, gestión de perfil, recuperación de contraseña.

HU-1 Registro de usuario · HU-2 Inicio de sesión · HU-3 Cierre de sesión · HU-4 Navegación sin autenticación · HU-5 Visualización de perfil · HU-6 Edición de perfil · HU-7 Acceso diferenciado por rol · HU-8 Registro de comerciante · HU-9 Verificación de comerciante (admin) · HU-10 Gestión de usuarios (admin) · HU-11 Recuperación de contraseña

### Sprint 2 — Gestión de Productos y Cotizaciones
Objetivo: catálogo, cotizaciones, personalización, métodos de pago.

HU-12 Gestión de producto · HU-13 Visualización de productos · HU-14 Visualización de tiendas · HU-15 Detalle de producto · HU-16 Búsqueda de productos · HU-17 Solicitud de cotización · HU-18 Visualización de cotizaciones (comerciante) · HU-19 Respuesta a cotización · HU-20 Visualización de respuesta · HU-21 Aceptación de cotización · HU-22 Rechazo de cotización · HU-23 Notificación de aceptación · HU-26 Personalización de producto · HU-27 Validación de personalización · HU-29 Seguimiento de personalizaciones (cliente) · HU-30 Seguimiento (comerciante) · HU-39 Método de pago

### Sprint 3 — Gestión de Pedidos, Personalizaciones y Reportes
Objetivo: conversión cotización→pedido, carrito, checkout, stock, seguimiento, reportes.

HU-24 Conversión de cotización a pedido · HU-25 Historial de cotizaciones · HU-28 Conversión de personalización a pedido · HU-31 Agregar al carrito · HU-32 Visualización de carrito · HU-33 Resumen previo de compra · HU-34 Confirmación de compra · HU-35 Cancelación de pedido · HU-36 Selección de tipo de entrega · HU-37 Visualización de pedidos (cliente) · HU-38 Gestión de estados de pedido · HU-40 Gestión de stock · HU-41 Visualización de pedidos (comerciante) · HU-42 Reporte de ventas · HU-43 Reporte de cotizaciones · HU-44 Visualización de logs (admin)

---

## 11. Historias arquitectónicamente significativas

Estas HUs definen decisiones estructurales clave. Préstales atención especial:

- **HU-1/HU-2 (Registro y verificación):** Dispara la creación del tenant. Define multi-tenancy, RBAC y comunicación asíncrona (verificación por correo).
- **HU-15/HU-16 (Productos con variantes):** Modelo de variantes (talla, color, diseño). Riesgo de condiciones de carrera en inventario → requiere transaccionalidad.
- **HU-34/HU-39 (Confirmación de compra + pago):** Integración con Stripe vía Facade. Operación transaccional crítica (crear pedido + descontar stock + cobrar) con rollback ante fallo.
- **HU-9 (Verificación de comerciante por admin):** Flujo de aprobación que habilita el tenant del vendedor.

---

## 12. Cómo trabajar en este proyecto (instrucciones para Claude Code)

1. **Antes de codear:** identifica a qué módulo y sprint pertenece la tarea. Respeta los límites de módulo.
2. **Sigue las convenciones de la sección 4 estrictamente** (sufijos de clase, snake_case en BD, estructura de paquetes).
3. **Backend primero, frontend después** para cada HU (el frontend consume la API).
4. **Capa por capa:** entity → repository → service (interface + impl) → controller → dto + mapper. Luego pruebas.
5. **Multi-tenancy siempre presente:** toda entidad de comercio lleva `vendedor_id`/`tenant_id` y los repositorios filtran por él.
6. **Toda lógica de negocio va en `@Service`.** Los controllers solo delegan. El frontend nunca tiene lógica de negocio.
7. **Pruebas obligatorias** para la capa de servicio (mínimo 70% cobertura). Usa el patrón `debeHacerX_cuandoY`.
8. **Commits con formato** `[módulo]: descripción en imperativo`. Trabaja en ramas `feature/`.
9. **Operaciones críticas con `@Transactional`** y rollback. Correos con `@Async`.
10. **No uses plantillas de e-commerce preconstruidas.** Implementa la lógica desde cero.

### Comandos típicos esperados (ajustar según el repo real)

```bash
# Backend
mvn clean install          # build + tests
mvn spring-boot:run        # levantar API
mvn test                   # solo pruebas
mvn jacoco:report          # reporte de cobertura

# Frontend
npm install
npm run dev                # Vite dev server
npm run build              # build de producción
npm run test               # React Testing Library

# Docker
docker-compose up -d       # entorno local (MySQL + backend + frontend)
```

> Nota: verifica los comandos reales en el `pom.xml`, `package.json` y `docker-compose.yml` del repositorio antes de ejecutarlos. Los anteriores son los estándar para este stack.

---

## 13. Equipo

10 integrantes (grupo Club Penguin): Ariana Burga Risco (coordinadora), Brillytd Pollo Libia, Ricardo Valentino Lara Figueroa, Alessandro Salvador Santé Vega, Leonardo Jaime Flores Vera, Claudia Stephanie Serpa Paredes, Kevin Daniel Alcca Chávez, Juan Diego Zavala Viscardo, Giancarlo Edwin Vilchez Canaza, John Manuel Arzapalo Arana.

Cliente / Product Owner: Prof. Luis Flores.
