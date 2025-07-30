# 🎵 Dexbot - Documentación Completa

## 📋 Índice
- [Comandos de Música](#comandos-de-música)
- [Comandos de Información](#comandos-de-información)
- [Comandos de Diversión](#comandos-de-diversión)
- [Comandos de Moderación](#comandos-de-moderación)
- [Comandos de Utilidad](#comandos-de-utilidad)
- [Comandos de Administración](#comandos-de-administración)
- [Comandos de Minecraft](#comandos-de-minecraft)
- [Comandos de Niveles](#comandos-de-niveles)
- [Eventos del Bot](#eventos-del-bot)
- [Configuración](#configuración)

---

## 🎵 Comandos de Música

### `/play` - Reproducir música
Reproduce una canción desde YouTube, Spotify, SoundCloud, Deezer o una URL directa.

**Uso:** `/play query:[canción/URL] source:[fuente]`

**Parámetros:**
- `query` (requerido): Nombre de la canción o URL
- `source` (opcional): Fuente de búsqueda (YouTube, YouTube Music, Spotify, SoundCloud, Deezer)

**Ejemplos:**
```
/play query:Bohemian Rhapsody Queen
/play query:https://www.youtube.com/watch?v=fJ9rUzIMcZQ
/play query:https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv source:Spotify
/play query:despacito source:YouTube Music
```

**Características:**
- Soporte para múltiples fuentes de audio
- Autocompletado inteligente de búsqueda
- Soporte para playlists completas
- Agregado automático a la cola

---

### `/search` - Buscar música
Busca una canción y permite seleccionar de una lista de resultados.

**Uso:** `/search query:[búsqueda] source:[fuente]`

**Parámetros:**
- `query` (requerido): Término de búsqueda
- `source` (opcional): Fuente de búsqueda

**Ejemplos:**
```
/search query:imagine dragons
/search query:rock music source:Spotify
/search query:electronic music source:SoundCloud
```

**Características:**
- Menú interactivo de selección
- Hasta 10 resultados por búsqueda
- Vista previa de información de cada canción

---

### `/queue` - Gestión de cola
Gestiona la cola de reproducción actual.

**Subcomandos:**
- `view` - Ver la cola actual
- `remove song:[posición]` - Eliminar una canción específica
- `clear` - Limpiar toda la cola

**Ejemplos:**
```
/queue view
/queue remove song:3
/queue clear
```

**Características:**
- Paginación para colas largas
- Información detallada de cada canción
- Duración total de la cola
- Navegación con botones

---

### `/playlist` - Gestión de playlists
Crea y gestiona playlists personales.

**Subcomandos:**
- `create name:[nombre]` - Crear nueva playlist
- `load name:[nombre]` - Cargar playlist en la cola
- `add name:[playlist] query:[canción]` - Agregar canción a playlist
- `addcurrent name:[playlist]` - Agregar canción actual
- `addqueue name:[playlist]` - Agregar toda la cola actual
- `remove name:[playlist] position:[pos]` - Eliminar canción
- `view name:[playlist]` - Ver contenido de playlist
- `list` - Listar todas las playlists
- `delete name:[playlist]` - Eliminar playlist

**Ejemplos:**
```
/playlist create name:"Mi Playlist Rock"
/playlist load name:"Mi Playlist Rock"
/playlist add name:"Mi Playlist" query:"Hotel California"
/playlist addcurrent name:"Favoritas"
/playlist view name:"Mi Playlist Rock"
/playlist list
```

**Características:**
- Playlists personales por usuario
- Autocompletado de nombres de playlists
- Vista detallada con navegación
- Soporte para múltiples fuentes

---

### `/controls` - Controles de reproducción
Controles básicos para la reproducción de música.

**Subcomandos:**
- `join` - Unirse al canal de voz
- `pause` - Pausar la reproducción
- `resume` - Reanudar la reproducción
- `skip` - Saltar a la siguiente canción
- `stop` - Detener y limpiar cola
- `leave` - Salir del canal de voz
- `shuffle` - Mezclar la cola aleatoriamente
- `seek time:[tiempo]` - Ir a un tiempo específico
- `volume set:[nivel]` - Cambiar volumen (0-100)

**Ejemplos:**
```
/controls join
/controls pause
/controls resume
/controls skip
/controls volume set:75
/controls seek time:1:30
/controls shuffle
```

---

### `/nowplaying` - Canción actual
Muestra información detallada sobre la canción que se está reproduciendo.

**Uso:** `/nowplaying`

**Información mostrada:**
- Título y artista de la canción
- Barra de progreso visual
- Duración actual/total
- Quién solicitó la canción
- Canciones en cola
- Volumen actual
- Modo de repetición
- Estado de reproducción

**Ejemplo:**
```
/nowplaying
```

---

### `/autoplay` - Reproducción automática
Activa/desactiva la reproducción automática de canciones relacionadas.

**Uso:** `/autoplay`

**Características:**
- Compatible con YouTube y YouTube Music
- Agrega automáticamente canciones relacionadas
- Se activa cuando la cola se vacía
- Funciona con el historial de reproducción

**Ejemplo:**
```
/autoplay
```

---

### `/loop` - Modo de repetición
Configura el modo de repetición para la reproducción.

**Uso:** `/loop mode:[modo]`

**Modos disponibles:**
- `off` - Sin repetición
- `track` - Repetir canción actual
- `queue` - Repetir toda la cola

**Ejemplos:**
```
/loop mode:track
/loop mode:queue
/loop mode:off
```

---

### `/filters` - Filtros de audio
Aplica filtros de audio a la reproducción actual.

**Uso:** `/filters filter:[filtro] value:[valor]`

**Filtros disponibles:**
- `clear` - Limpiar todos los filtros
- `nightcore` - Efecto nightcore
- `vaporwave` - Efecto vaporwave
- `lowpass` - Filtro de paso bajo
- `karaoke` - Modo karaoke
- `rotation` - Rotación 8D
- `tremolo` - Efecto tremolo
- `vibrato` - Efecto vibrato
- `speed` - Cambiar velocidad
- `pitch` - Cambiar tono
- `rate` - Cambiar tasa
- `volume` - Amplificar volumen
- `bassboost` - Refuerzo de graves
- `8d` - Audio 8D
- `rock` - Ecualizador rock

**Ejemplos:**
```
/filters filter:nightcore
/filters filter:bassboost
/filters filter:speed value:1.25
/filters filter:clear
```

---

### `/lyrics` - Letras de canciones
Obtiene la letra de la canción que se está reproduciendo actualmente.

**Uso:** `/lyrics`

**Características:**
- Búsqueda automática de letras
- Paginación para letras largas
- Soporte para múltiples formatos
- Navegación con botones

**Ejemplo:**
```
/lyrics
```

---

## ℹ️ Comandos de Información

### `/botinfo` - Información del bot
Muestra información detallada sobre Dexbot.

**Uso:** `/botinfo`

**Información mostrada:**
- Versión del bot
- Tiempo en línea
- Número de servidores
- Número de usuarios
- Latencia
- Uso de memoria
- Versión de Node.js

---

### `/help` - Ayuda
Muestra el menú de ayuda con todos los comandos disponibles.

**Uso:** `/help [comando]`

**Parámetros:**
- `comando` (opcional): Comando específico para ayuda detallada

**Ejemplos:**
```
/help
/help play
/help filters
```

---

### `/ping` - Latencia
Verifica la latencia del bot y la API de Discord.

**Uso:** `/ping`

**Información mostrada:**
- Latencia del bot
- Latencia de la API
- Tiempo de respuesta

---

### `/serverinfo` - Información del servidor
Muestra información detallada sobre el servidor actual.

**Uso:** `/serverinfo`

**Información mostrada:**
- Nombre del servidor
- Propietario
- Fecha de creación
- Número de miembros
- Número de canales
- Roles
- Emojis
- Nivel de verificación

---

### `/userinfo` - Información de usuario
Muestra información detallada sobre un usuario.

**Uso:** `/userinfo [usuario]`

**Parámetros:**
- `usuario` (opcional): Usuario a consultar (por defecto: tú)

**Información mostrada:**
- Nombre de usuario y apodo
- ID de usuario
- Fecha de creación de cuenta
- Fecha de unión al servidor
- Roles
- Avatar

---

### `/roleinfo` - Información de rol
Muestra información detallada sobre un rol específico.

**Uso:** `/roleinfo rol:[rol]`

**Parámetros:**
- `rol` (requerido): Rol a consultar

**Información mostrada:**
- Nombre del rol
- Color
- Permisos
- Número de miembros
- Fecha de creación
- Posición en jerarquía

---

### `/invite` - Enlace de invitación
Muestra el enlace de invitación del bot.

**Uso:** `/invite`

---

### `/support` - Servidor de soporte
Proporciona el enlace al servidor de soporte oficial.

**Uso:** `/support`

---

## 🎈 Comandos de Diversión

### `/8ball` - Bola mágica 8
Haz una pregunta a la bola mágica 8 y recibe una respuesta.

**Uso:** `/8ball pregunta:[pregunta]`

**Ejemplos:**
```
/8ball pregunta:¿Lloverá mañana?
/8ball pregunta:¿Debería estudiar más?
```

---

### `/coinflip` - Lanzar moneda
Lanza una moneda y obtén cara o cruz.

**Uso:** `/coinflip`

---

### `/dadjoke` - Chiste de papá
Recibe un chiste de papá aleatorio.

**Uso:** `/dadjoke`

---

### `/joke` - Chiste
Recibe un chiste aleatorio.

**Uso:** `/joke`

---

### `/meme` - Meme
Ve un meme aleatorio.

**Uso:** `/meme`

---

### `/catfact` - Dato curioso de gatos
Obtén un dato curioso aleatorio sobre gatos.

**Uso:** `/catfact`

---

### `/dogfact` - Dato curioso de perros
Obtén un dato curioso aleatorio sobre perros.

**Uso:** `/dogfact`

---

### `/randomnumber` - Número aleatorio
Genera un número aleatorio dentro de un rango.

**Uso:** `/randomnumber min:[mínimo] max:[máximo]`

**Ejemplos:**
```
/randomnumber min:1 max:100
/randomnumber min:1 max:6
```

---

### `/trivia` - Trivia
Responde una pregunta de trivia.

**Uso:** `/trivia`

**Características:**
- Preguntas de múltiples categorías
- Diferentes niveles de dificultad
- Sistema de puntuación

---

### `/pp` - Medidor de... tamaño
Comando de broma que "mide" algo.

**Uso:** `/pp [usuario]`

---

## 🔨 Comandos de Moderación

### `/ban` - Banear usuario
Banea a un usuario del servidor.

**Uso:** `/ban usuario:[usuario] razón:[razón] eliminar_mensajes:[días]`

**Parámetros:**
- `usuario` (requerido): Usuario a banear
- `razón` (opcional): Razón del baneo
- `eliminar_mensajes` (opcional): Días de mensajes a eliminar (0-7)

**Ejemplos:**
```
/ban usuario:@problemático razón:"Spam continuo"
/ban usuario:@troll eliminar_mensajes:1
```

---

### `/kick` - Expulsar usuario
Expulsa a un usuario del servidor.

**Uso:** `/kick usuario:[usuario] razón:[razón]`

**Ejemplos:**
```
/kick usuario:@problemático razón:"Comportamiento inapropiado"
```

---

### `/timeout` - Tiempo fuera
Aplica tiempo fuera a un usuario.

**Uso:** `/timeout usuario:[usuario] duración:[tiempo] razón:[razón]`

**Ejemplos:**
```
/timeout usuario:@spam duración:10m razón:"Spam"
/timeout usuario:@troll duración:1h razón:"Trolling"
```

---

### `/untimeout` - Quitar tiempo fuera
Quita el tiempo fuera de un usuario.

**Uso:** `/untimeout usuario:[usuario]`

---

### `/warn` - Advertir usuario
Advierte a un usuario por comportamiento inapropiado.

**Uso:** `/warn usuario:[usuario] razón:[razón]`

**Ejemplos:**
```
/warn usuario:@nuevo razón:"Lenguaje inapropiado"
```

---

### `/warnings` - Ver advertencias
Ve las advertencias de un usuario.

**Uso:** `/warnings usuario:[usuario]`

---

### `/clear` - Limpiar mensajes
Elimina múltiples mensajes a la vez.

**Uso:** `/clear cantidad:[número] usuario:[usuario]`

**Parámetros:**
- `cantidad` (requerido): Número de mensajes a eliminar (1-100)
- `usuario` (opcional): Eliminar solo mensajes de este usuario

**Ejemplos:**
```
/clear cantidad:10
/clear cantidad:50 usuario:@spam
```

---

### `/lock` - Bloquear canal
Bloquea un canal para evitar que los usuarios envíen mensajes.

**Uso:** `/lock canal:[canal] razón:[razón]`

---

### `/unlock` - Desbloquear canal
Desbloquea un canal previamente bloqueado.

**Uso:** `/unlock canal:[canal]`

---

### `/nick` - Cambiar apodo
Cambia el apodo de un usuario.

**Uso:** `/nick usuario:[usuario] apodo:[nuevo_apodo]`

---

### `/unban` - Desbanear usuario
Remueve el baneo de un usuario.

**Uso:** `/unban usuario_id:[ID] razón:[razón]`

---

## 🪛 Comandos de Utilidad

### `/calculator` - Calculadora
Realiza cálculos matemáticos.

**Uso:** `/calculator expresión:[expresión]`

**Ejemplos:**
```
/calculator expresión:2+2*3
/calculator expresión:sqrt(16)
/calculator expresión:(10*5)/2
```

---

### `/translate` - Traductor
Traduce texto entre idiomas.

**Uso:** `/translate texto:[texto] desde:[idioma] hacia:[idioma]`

**Ejemplos:**
```
/translate texto:"Hello world" desde:en hacia:es
/translate texto:"Hola mundo" hacia:en
```

---

### `/weather` - Clima
Consulta el clima de una ubicación.

**Uso:** `/weather ubicación:[ciudad]`

**Ejemplos:**
```
/weather ubicación:"Madrid, España"
/weather ubicación:"New York"
```

---

### `/define` - Definición
Busca la definición de una palabra.

**Uso:** `/define palabra:[palabra]`

**Ejemplos:**
```
/define palabra:serendipia
/define palabra:ephemeral
```

---

### `/todo` - Lista de tareas
Gestiona tu lista personal de tareas pendientes.

**Uso:** `/todo acción:[acción] tarea:[descripción]`

**Acciones:**
- `add` - Agregar tarea
- `remove` - Eliminar tarea
- `list` - Ver todas las tareas
- `complete` - Marcar como completada

---

## ⚙️ Comandos de Administración

### `/giveaway` - Sorteos
Crea y gestiona sorteos en el servidor.

**Subcomandos:**
- `start` - Iniciar nuevo sorteo
- `end` - Finalizar sorteo
- `reroll` - Re-sortear ganadores
- `list` - Ver sorteos activos

**Ejemplos:**
```
/giveaway start premio:"Discord Nitro" duración:1d ganadores:1
/giveaway end sorteo_id:123456
/giveaway reroll sorteo_id:123456
```

---

### `/welcome` - Sistema de bienvenida
Configura mensajes de bienvenida personalizados.

**Uso:** `/welcome canal:[canal] mensaje:[mensaje] imagen:[url]`

**Características:**
- Mensajes personalizables
- Imágenes de bienvenida
- Variables dinámicas
- Canal específico

---

### `/autorole` - Roles automáticos
Configura roles que se asignan automáticamente a nuevos miembros.

**Uso:** `/autorole agregar:[rol] | quitar:[rol] | lista`

---

### `/guildsettings` - Configuración del servidor
Gestiona configuraciones específicas del servidor.

**Opciones disponibles:**
- Prefijo de comandos
- Canal de logs
- Rol de moderador
- Configuraciones de música
- Configuraciones de niveles

---

### `/leveladmin` - Administración de niveles
Configura el sistema de niveles del servidor.

**Subcomandos:**
- `enable/disable` - Activar/desactivar sistema
- `set` - Establecer nivel de usuario
- `reset` - Resetear progreso
- `multiplier` - Configurar multiplicador de XP

---

## 🌎 Comandos de Minecraft

### `/achievement` - Logro de Minecraft
Genera una imagen de logro de Minecraft personalizada.

**Uso:** `/achievement texto:[texto] icono:[icono]`

**Ejemplos:**
```
/achievement texto:"¡Conseguiste diamantes!" icono:diamond
/achievement texto:"Primera muerte" icono:skull
```

---

### `/skin` - Skin de Minecraft
Muestra la skin de un jugador de Minecraft.

**Uso:** `/skin jugador:[nombre]`

**Ejemplos:**
```
/skin jugador:Notch
/skin jugador:Steve
```

---

### `/headavatar` - Avatar de cabeza
Obtiene el avatar de la cabeza de un jugador.

**Uso:** `/headavatar jugador:[nombre]`

---

### `/bodyavatar` - Avatar de cuerpo
Ve el avatar del cuerpo de un jugador.

**Uso:** `/bodyavatar jugador:[nombre]`

---

### `/fullbody` - Modelo completo
Ve el modelo completo de un jugador.

**Uso:** `/fullbody jugador:[nombre]`

---

### `/playerhead` - Cabeza de jugador
Obtiene la imagen de la cabeza de un jugador.

**Uso:** `/playerhead jugador:[nombre]`

---

### `/serverstatus` - Estado del servidor
Verifica el estado de un servidor de Minecraft.

**Uso:** `/serverstatus ip:[dirección] puerto:[puerto]`

**Ejemplos:**
```
/serverstatus ip:mc.hypixel.net
/serverstatus ip:play.cubecraft.net puerto:25565
```

---

### `/addserverstatus` - Agregar servidor
Agrega un servidor de Minecraft para monitoreo.

**Uso:** `/addserverstatus nombre:[nombre] ip:[ip] puerto:[puerto]`

---

### `/removeserverstatus` - Quitar servidor
Remueve un servidor del monitoreo.

**Uso:** `/removeserverstatus nombre:[nombre]`

---

### `/listserverstatus` - Listar servidores
Lista todos los servidores monitoreados.

**Uso:** `/listserverstatus`

---

## 📊 Comandos de Niveles

### `/level` - Ver nivel
Verifica tu nivel actual y experiencia.

**Uso:** `/level [usuario]`

**Información mostrada:**
- Nivel actual
- Experiencia actual/requerida
- Ranking en el servidor
- Barra de progreso visual

---

### `/leaderboard` - Tabla de líderes
Ve la tabla de líderes del servidor.

**Uso:** `/leaderboard`

**Características:**
- Top 10 usuarios por nivel
- Paginación para ver más
- Información detallada de cada usuario

---

## 📡 Eventos del Bot

### 🎵 Eventos de Música

#### `trackStart`
Se ejecuta cuando comienza una nueva canción.
```javascript
// Anuncia la nueva canción con controles interactivos
// Muestra información detallada de la pista
// Proporciona botones de control de reproducción
```

#### `trackEnd` 
Se ejecuta cuando termina una canción.
```javascript
// Limpia mensajes anteriores
// Activa autoplay si está habilitado
// Gestiona la transición entre canciones
```

#### `queueEnd`
Se ejecuta cuando la cola se vacía.
```javascript
// Notifica que la cola ha terminado
// Sugiere agregar más música
// Limpia datos temporales
```

### 👥 Eventos de Servidor

#### `guildMemberAdd`
Se ejecuta cuando un nuevo miembro se une.
```javascript
// Envía mensaje de bienvenida
// Asigna roles automáticos
// Actualiza estadísticas del servidor
```

#### `voiceStateUpdate`
Se ejecuta cuando cambia el estado de voz.
```javascript
// Gestiona conexiones/desconexiones de voz
// Pausa música si no hay miembros
// Actualiza información de canales
```

### 🎮 Eventos de Interacción

#### `ButtonRole`
Maneja interacciones de botones para roles.
```javascript
// Asigna/remueve roles mediante botones
// Valida permisos
// Envía confirmaciones
```

#### `ticketSystem`
Gestiona el sistema de tickets.
```javascript
// Crea nuevos tickets
// Gestiona cierre de tickets
// Maneja transcripciones
```

---

## ⚙️ Configuración

### 🔧 Variables de Entorno

```env
# Token del bot de Discord
DISCORD_TOKEN=tu_token_aquí

# ID del cliente de Discord
CLIENT_ID=tu_client_id

# URL de la base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/dexbot

# Clave API del clima
WEATHER_API_KEY=tu_weather_api_key

# Configuración de Lavalink
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass

# Configuración de Spotify (opcional)
SPOTIFY_CLIENT_ID=tu_spotify_client_id
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret
```

### 📋 Archivo de Configuración

```json
{
  "token": "TU_TOKEN_DE_DISCORD",
  "clientId": "TU_CLIENT_ID",
  "guildId": "ID_DEL_SERVIDOR_DE_PRUEBA",
  "embedColor": "#5865F2",
  "music": {
    "defaultVolume": 50,
    "maxQueueSize": 100,
    "maxPlaylistSize": 50,
    "leaveOnEmpty": true,
    "leaveOnEmptyDelay": 300000,
    "enableFilters": true,
    "enableLyrics": true
  },
  "moderation": {
    "defaultBanDeleteDays": 0,
    "maxWarnings": 3,
    "autoModerationEnabled": true
  },
  "levels": {
    "enabled": true,
    "xpPerMessage": [15, 25],
    "xpCooldown": 60000,
    "announceLevelUp": true
  }
}
```

### 🎵 Configuración de Lavalink

```yaml
# application.yml para Lavalink
server:
  port: 2333
  address: 0.0.0.0
lavalink:
  server:
    password: "youshallnotpass"
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
      local: false
    bufferDurationMs: 400
    frameBufferDurationMs: 5000
    opusEncodingQuality: 10
    resamplingQuality: LOW
    trackStuckThresholdMs: 10000
    useSeekGhosting: true
    youtubePlaylistLoadLimit: 6
    playerUpdateInterval: 5
    youtubeSearchEnabled: true
    soundcloudSearchEnabled: true
```

### 🛡️ Permisos Requeridos

El bot necesita los siguientes permisos en Discord:

#### Permisos Básicos:
- `View Channels` - Ver canales
- `Send Messages` - Enviar mensajes
- `Embed Links` - Incrustar enlaces
- `Read Message History` - Leer historial
- `Use Slash Commands` - Usar comandos slash
- `Add Reactions` - Agregar reacciones

#### Permisos de Música:
- `Connect` - Conectarse a voz
- `Speak` - Hablar en canales de voz
- `Use Voice Activity` - Usar actividad de voz

#### Permisos de Moderación:
- `Manage Messages` - Gestionar mensajes
- `Kick Members` - Expulsar miembros
- `Ban Members` - Banear miembros
- `Manage Roles` - Gestionar roles
- `Manage Channels` - Gestionar canales
- `Moderate Members` - Moderar miembros

### 🎯 Fuentes de Audio Soportadas

#### 🎥 **YouTube**
- Videos individuales
- Playlists públicas
- YouTube Music
- Videos en vivo
- Videos privados no listados (con URL)

#### 🎵 **Spotify**
- Canciones individuales
- Álbumes completos
- Playlists públicas
- Artistas (canciones populares)
- Requires Spotify API credentials

#### 🎤 **SoundCloud**
- Tracks individuales
- Sets/Playlists
- Usuarios (canciones populares)
- Tracks privados (con URL)

#### 🎶 **Deezer**
- Canciones individuales
- Álbumes
- Playlists públicas
- Artistas

#### 📻 **Otras Fuentes**
- Streams de radio en vivo
- Archivos de audio directos (MP3, WAV, OGG)
- URLs de audio HTTP/HTTPS

### 🎛️ Filtros de Audio Disponibles

#### 🌙 **Nightcore**
- Aumenta velocidad y tono
- Efecto característico de música nightcore
- Compatible con otros filtros

#### 🌊 **Vaporwave**
- Reduce velocidad y tono
- Efecto retro/vintage
- Incompatible con nightcore

#### ⬇️ **Lowpass**
- Filtro de paso bajo
- Reduce frecuencias altas
- Efecto de audio "apagado"

#### 🎤 **Karaoke**
- Reduce voces centrales
- Ideal para karaoke
- Preserva instrumentales

#### 🔄 **Rotation (8D)**
- Simula audio 8D
- Efecto de rotación espacial
- Mejor con auriculares

#### 〰️ **Tremolo**
- Modulación de amplitud
- Efecto de "vibración" en volumen
- Configurable en frecuencia

#### 📳 **Vibrato**
- Modulación de frecuencia
- Efecto de "vibración" en tono
- Configurable en profundidad

#### ⚡ **Speed Control**
- Cambio de velocidad sin afectar tono
- Rango: 0.25x - 3.0x
- Preserva calidad de audio

#### 🎼 **Pitch Control**
- Cambio de tono sin afectar velocidad
- Rango: 0.5x - 2.0x
- Útil para transposición

#### 🎚️ **Volume Boost**
- Amplificación de volumen
- Más allá del 100% normal
- Cuidado con la distorsión

#### 🎛️ **Equalizer**
- Control de 15 bandas de frecuencia
- Presets: Rock, Pop, Jazz, Classical
- Personalización completa

### 📊 Sistema de Niveles

#### 💎 **Mecánicas de XP**
- XP por mensaje: 15-25 puntos aleatorios
- Cooldown: 60 segundos entre mensajes
- Sin XP por comandos de bot
- Bonus en canales específicos (configurable)

#### 🏆 **Niveles y Recompensas**
- Fórmula: `XP requerida = nivel² × 100`
- Anuncios automáticos de subida
- Roles automáticos por nivel (configurable)
- Leaderboard global del servidor

#### 📈 **Estadísticas Avanzadas**
- Total de mensajes enviados
- Posición en el servidor
- Progreso visual con barras
- Historial de actividad

### 🎁 Sistema de Sorteos

#### ⚙️ **Configuración de Sorteos**
- Duración personalizable
- Múltiples ganadores
- Requisitos de participación
- Mensajes personalizados

#### 🎯 **Tipos de Requisitos**
- Roles específicos
- Invitaciones mínimas
- Edad de cuenta
- Tiempo en el servidor
- Reacciones específicas

#### 🔄 **Gestión Avanzada**
- Pausar/reanudar sorteos
- Editar configuración activa
- Re-sortear ganadores
- Historial de sorteos

### 🎫 Sistema de Tickets

#### 📝 **Creación de Tickets**
- Categorías personalizables
- Formularios de información
- Asignación automática de staff
- Logs detallados

#### 🛠️ **Gestión de Tickets**
- Panel de control administrativo
- Transcripciones automáticas
- Sistema de etiquetas
- Estadísticas de tiempo de respuesta

#### 🚫 **Control de Acceso**
- Blacklist de usuarios
- Límite de tickets activos
- Roles de soporte específicos
- Permisos granulares

---

## 🚀 Ejemplos de Uso Completos

### 🎵 Sesión de Música Típica

```bash
# 1. Usuario se une a canal de voz y reproduce música
/play query:bohemian rhapsody source:YouTube

# 2. Agrega más canciones a la cola
/play query:hotel california
/search query:imagine dragons

# 3. Gestiona la reproducción
/queue view
/controls shuffle
/loop mode:queue

# 4. Aplica efectos de audio
/filters filter:bassboost
/filters filter:8d

# 5. Crea una playlist con las canciones favoritas
/playlist create name:"Rock Clásico"
/playlist addcurrent name:"Rock Clásico"

# 6. Ve la letra de la canción actual
/lyrics
```

### 🛡️ Moderación del Servidor

```bash
# 1. Configurar sistema de bienvenida
/welcome canal:#general mensaje:"¡Bienvenido {user} a {server}!"

# 2. Configurar roles automáticos
/autorole agregar:@Miembro

# 3. Moderar usuarios problemáticos
/warn usuario:@spam razón:"Enviando enlaces no autorizados"
/timeout usuario:@troll duración:30m razón:"Comportamiento disruptivo"

# 4. Limpiar mensajes spam
/clear cantidad:20 usuario:@spam

# 5. Ver historial de advertencias
/warnings usuario:@problemático
```

### 🎮 Minecraft y Diversión

```bash
# 1. Monitorear servidor de Minecraft
/addserverstatus nombre:"Mi Server" ip:play.miserver.com puerto:25565
/serverstatus ip:play.miserver.com

# 2. Generar contenido de Minecraft
/achievement texto:"¡Primera casa construida!" icono:house
/skin jugador:Notch

# 3. Entretenimiento general
/trivia
/8ball pregunta:¿Será un buen día?
/meme
```

---

## 🔗 Enlaces y Recursos

### 📚 **Documentación Adicional**
- [Documentación de Discord.js](https://discord.js.org/)
- [API de Discord](https://discord.com/developers/docs)
- [Lavalink](https://github.com/freyacodes/Lavalink)

### 🆘 **Soporte**
- **Discord**: [Servidor de Soporte](https://discord.gg/kAYpdenZ8b)
- **GitHub**: [Repositorio del Bot](https://github.com/Charlie-Jsc/Dexbot)
- **Issues**: [Reportar Problemas](https://github.com/Charlie-Jsc/Dexbot/issues)

### 📖 **Guías**
- Configuración inicial del bot
- Hosting en la nube
- Configuración de Lavalink
- Resolución de problemas comunes

---

## ⚠️ Limitaciones y Consideraciones

### 🎵 **Música**
- Algunas fuentes pueden requerir VPN en ciertos países
- Calidad de audio limitada por la fuente original
- Filtros pueden afectar la calidad en dispositivos móviles

### 🛡️ **Moderación**
- Permisos del bot deben ser superiores a los usuarios moderados
- Algunos comandos requieren permisos específicos del servidor
- Logs de moderación dependen de la configuración del servidor

### 📊 **Rendimiento**
- Bot optimizado para servidores medianos (hasta 5000 miembros)
- Uso de memoria aumenta con número de colas de música activas
- Base de datos requiere mantenimiento regular para óptimo rendimiento

---

## 🔄 Actualizaciones y Changelog

### 📅 **Próximas Características**
- [ ] Dashboard web para configuración
- [ ] Sistema de economía virtual
- [ ] Minijuegos integrados
- [ ] Integración con más APIs de música
- [ ] Sistema de alertas personalizado

### 🐛 **Problemas Conocidos**
- Filtros de audio pueden causar lag en servidores grandes
- Autoplay limitado a YouTube por restricciones de API
- Algunos comandos de Minecraft pueden fallar con servidores offline

---

<div align="center">

## 🎉 ¡Gracias por usar Dexbot!

*¿Tienes sugerencias o encontraste un bug? ¡Háznossaber en nuestro [servidor de Discord](https://discord.gg/kAYpdenZ8b)!*

**Hecho con ❤️ por el equipo de Dexbot**

</div>
