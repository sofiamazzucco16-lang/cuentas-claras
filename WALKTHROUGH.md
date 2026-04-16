# Guía de Uso y Ejecución - Cuentas Claras

## 1. Requisitos Previos
Para ejecutar esta aplicación, necesitas tener instalado **Node.js** en tu computadora.
Actualmente, el sistema indica que no está instalado.

### Cómo instalar Node.js:
1.  Ve a [nodejs.org](https://nodejs.org/).
2.  Descarga la versión **LTS** (Recommended for Most Users).
3.  Instálalo siguiendo las instrucciones del instalador.
4.  Reinicia tu terminal (o VS Code) para que los cambios surtan efecto.

## 2. Instalación de Dependencias
Una vez instalado Node.js, abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto descargará todas las librerías necesarias (React, Vite, Framer Motion, etc.).

## 3. Ejecutar la Aplicación
Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

Verás un mensaje como `Local: http://localhost:5173/`. Abre ese enlace en tu navegador.

## 4. Flujo de la Aplicación

### Pantalla de Bienvenida
Al abrir la app, verás la nueva pantalla de bienvenida con el diseño "Dark Premium".
-   Haz clic en **"Comenzar"** para iniciar.

### Cargar Hoja de Tiempo
-   Arrastra y suelta una imagen de tu hoja de tiempo (timesheet) en el área designada.
-   O haz clic para seleccionar un archivo.
-   La IA procesará la imagen automáticamente.

### Revisión y Análisis
-   Verás un resumen de los turnos detectados.
-   Puedes editar cualquier error si la IA no leyó bien algún número.
-   Confirma para ver el cálculo de pagos.

### Dashboard de Resultados
-   **Tarjetas de Resumen**: Verás tu pago neto estimado, horas totales y desglose de impuestos.
-   **Gráficos**:
    -   **Horas por Día**: Un gráfico de barras animado mostrando tus horas diarias.
    -   **Ganancias**: Un desglose visual de tus ingresos.
-   **Historial**: Tus trabajos se guardan localmente para que puedas consultarlos después.
