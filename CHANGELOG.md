# Changelog

## [1.0.9] - 2026-08-14

- Nueva pestaña de secuaces (`tab-minion`) en la hoja de personaje.
- Mejoras en el catálogo de rasgos de secuaces (`minion-traits`).
- Correcciones en la lógica del actor y en la hoja de personaje.
- Mejoras en las pestañas de combate y principal.

## [1.0.8] - 2026-08-14

- Mejoras en el catálogo de rasgos de secuaces (`minion-traits`).
- Correcciones en el modelo de datos del personaje, la lógica del actor y la
  hoja de personaje.
- Mejoras en las pestañas de combate, principal y progresión.
- Ajustes de estilos (CSS).

## [1.0.7] - 2026-08-14

- Mejoras en las técnicas de aura maligna (`evil-aura-techniques`).
- Mejoras en la automatización racial de arcosianos y en los talentos.
- Correcciones en el modelo de datos del personaje, la lógica del actor y la
  hoja de personaje.
- Mejoras en las pestañas de combate y talentos, y en los bonos raciales de
  combate.

## [1.0.6] - 2026-08-09

- Nuevos parciales de plantilla: bonos raciales y de transformación en combate,
  y rastreador de crueldad (`cruelty-tracker`).
- Mejoras en la lógica del actor y en la hoja de personaje.
- Mejoras en las pestañas de combate, principal, rasgos y transformaciones.
- Ajustes en la carga de plantillas y en los estilos (CSS).

## [1.0.5] - 2026-08-07

- Mejoras en la automatización de poderes de mejora (`enhancement-powers`).
- Correcciones en la lógica del actor y en la hoja de personaje.
- Mejoras en las pestañas de auras, combate, técnicas y rasgos.
- Ajustes de estilos (CSS).

## [1.0.4] - 2026-08-04

- Nuevos catálogos: rasgos cibernéticos (`cybernetic-traits`), meta-rasgos
  (`meta-traits`) y cualidades base (`base-qualities`), con su automatización.
- Mejoras en la automatización racial: bio-android, arcosianos, formas
  alternas y rasgos bestiales.
- Correcciones y mejoras en el sistema de duelos.
- Mejoras en la hoja de personaje, battle jacket y varias pestañas (bio,
  fusión, skills, técnicas, únicas, combate, equipo, downtime).
- Ajustes de estilos (CSS).

## [1.0.3] - 2026-07-26

- Nuevo sistema de duelos (`module/helpers/duel.mjs`).
- Nuevo catálogo de objetos básicos (`basic-items-catalog`) integrado en la
  pestaña de equipo.
- Mejoras extensas en la hoja de personaje y en la pestaña de combate.
- Mejoras en la automatización de talentos raciales.
- Ajustes de estilos (CSS) y plantillas de combate/equipo.

## [1.0.2] - 2026-05-14

- Compatibilidad con Foundry VTT v13 declarada (`compatibility.verified` y
  `maximum` a `"13"`).
- Migración del bloque `gridDistance`/`gridUnits` al objeto `grid` (formato
  v12+).
- Retirados `primaryTokenAttribute` y `secondaryTokenAttribute` (deprecados
  desde v11). Las barras de token deben configurarse desde el TokenDocument.

> ⚠️ **Aviso**: esta versión solo declara compatibilidad a nivel manifest. El
> código de los sheets sigue usando las clases ApplicationV1 (`ActorSheet`,
> `ItemSheet`), que están deprecadas en v13. Si aparecen errores en consola
> al cargar el sistema en v13, abre una issue con el stack trace.

## [1.0.1] - 2026-05-14

- Renombrado público a **Dragon Universe RPG - Old System** (manteniendo el ID
  interno `DBU-MRR-OLD` por compatibilidad con instalaciones existentes).
- Aclaración de créditos y permisos: automatización realizada con permiso del
  equipo de [dbu-rpg.com](https://dbu-rpg.com/).
- README y descripción actualizados para reflejar la naturaleza fan-made,
  gratuita y no comercial del proyecto.

## [1.0.0] - 2026-05-14

- Primera release pública del sistema para Foundry VTT v12.
- Hojas de personaje y NPC.
- Battle Jacket y módulos.
- Automatización racial completa.
- Compendio inicial de Racial Traits.
- Localización en español.
