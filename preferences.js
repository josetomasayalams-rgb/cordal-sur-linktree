"use strict";

(() => {
  const LANGUAGE_STORAGE_KEY = "cs-linktree-lang-v1";
  const THEME_STORAGE_KEY = "cs-linktree-theme-v1";
  const SUPPORTED_LANGUAGES = Object.freeze(["es", "pt", "en"]);
  const SUPPORTED_THEMES = Object.freeze(["light", "dark"]);
  const FALLBACK_LANGUAGE = "es";
  const FALLBACK_THEME = "dark";
  const HTML_LANGUAGES = Object.freeze({ es: "es-CL", pt: "pt-BR", en: "en" });
  const THEME_COLORS = Object.freeze({ light: "#153B33", dark: "#071914" });

  const TRANSLATIONS = Object.freeze({
    es: Object.freeze({
      "page.title": "Cordal Sur · Andes Chillán",
      "page.description": "Cordal Sur: alojamiento para hasta 7 huéspedes en Condominio Andes Chillán, Las Trancas. Consulta disponibilidad y prepara tu viaje.",
      "preferences.aria": "Preferencias de visualización",
      "language.aria": "Selector de idioma",
      "theme.aria": "Selector de tema",
      "theme.light": "Usar tema claro",
      "theme.dark": "Usar tema oscuro",
      "skip.main": "Ir al contenido principal",
      "page.heading": "Cordal Sur, alojamiento en Andes Chillán",
      "hero.photos": "Fotografías de Cordal Sur",
      "carousel.controls": "Controles del carrusel",
      "carousel.previous": "Foto anterior",
      "carousel.next": "Foto siguiente",
      "carousel.pause": "Pausar carrusel",
      "carousel.resume": "Reanudar carrusel",
      "carousel.reduced": "Carrusel pausado por preferencia de movimiento reducido",
      "gallery.open": "Ver las 38 fotos",
      "hero.eyebrow": "Andes Chillán · Las Trancas",
      "hero.title": "Tu pausa cerca de la montaña",
      "hero.description": "Un refugio acogedor para descansar, compartir y despertar entre bosque, nieve y aire cordillerano.",
      "hero.caption.bathroom": "Baño",
      "stay.features": "Características del alojamiento",
      "stay.guests": "Hasta 7 huéspedes",
      "stay.location": "Condominio Andes Chillán",
      "contact.question": "¿Qué fechas tienes en mente?",
      "contact.title": "Contáctanos por WhatsApp",
      "contact.detail": "Indícanos fechas y número de huéspedes",
      "contact.aria": "Contactar por WhatsApp",
      "contact.message": "Hola Cordal Sur, quiero consultar disponibilidad. Mis fechas son del ___ al ___ y somos ___ huéspedes.",
      "availability.eyebrow": "Disponibilidad",
      "availability.title": "Encuentra tus fechas",
      "availability.description": "Consulta la disponibilidad consolidada de nuestros calendarios de reserva.",
      "availability.loading": "Consultando disponibilidad…",
      "availability.refresh": "Actualizar disponibilidad",
      "availability.previous": "Mes anterior",
      "availability.next": "Mes siguiente",
      "availability.calendar.aria": "Calendario público de disponibilidad",
      "availability.available": "Disponible",
      "availability.reserved": "Reservado",
      "availability.reserved.checkout": "Reservado; disponible únicamente como fecha de salida",
      "availability.selected": "Seleccionado",
      "availability.today": "Hoy",
      "availability.past": "Fecha pasada",
      "availability.showPrices": "Mostrar precios",
      "availability.updated": "Actualizado {date}",
      "availability.stale": "Mostrando los últimos datos disponibles; podrían estar desactualizados.",
      "availability.unavailable": "No podemos confirmar la disponibilidad en este momento.",
      "availability.offline": "Sin conexión. Conservamos la última lectura disponible.",
      "availability.selectArrival": "Selecciona tu fecha de llegada.",
      "availability.selectDeparture": "Ahora selecciona tu fecha de salida.",
      "availability.invalidRange": "El rango atraviesa una noche reservada. Elige otra salida.",
      "availability.arrival": "Llegada",
      "availability.departure": "Salida",
      "availability.nights.label": "Noches",
      "availability.night": "{count} noche",
      "availability.nights": "{count} noches",
      "availability.confirmed": "Fechas disponibles",
      "availability.clear": "Borrar selección",
      "availability.consult": "Consultar estas fechas por WhatsApp",
      "availability.disclaimer": "Esta consulta no constituye una reserva. La disponibilidad y el valor final deben confirmarse con Cordal Sur.",
      "availability.weekday": "Día de semana",
      "availability.weekend": "Fin de semana",
      "availability.estimate": "Subtotal estimado",
      "availability.whatsapp": "Hola Cordal Sur, quiero consultar disponibilidad del {arrival} al {departure} ({nightLabel}). Somos ___ huéspedes.{price}",
      "availability.whatsapp.price": " Subtotal estimado: {total}, sujeto a confirmación.",
      "payment.kicker": "Pago seguro · Mercado Pago",
      "payment.title": "Abona a Cordal Sur",
      "payment.detail": "Ingresa el monto acordado y paga de forma segura mediante Mercado Pago",
      "payment.open": "Abrir instrucciones para abonar a Cordal Sur",
      "payment.dialog.kicker": "Pago seguro",
      "payment.dialog.title": "Antes de pagar",
      "payment.dialog.close": "Cerrar instrucciones de pago",
      "payment.dialog.description": "Serás dirigido al canal de pago de Cordal Sur en Mercado Pago.",
      "payment.step.amount": "Ingresa únicamente el monto acordado para tu reserva.",
      "payment.step.review": "Revisa el monto antes de elegir el medio de pago.",
      "payment.step.receipt": "Cuando finalices, envía el comprobante por WhatsApp.",
      "payment.destination": "Destino seguro:",
      "payment.continue": "Continuar a Mercado Pago",
      "payment.continue.aria": "Continuar a Mercado Pago; se abrirá en una pestaña nueva",
      "payment.receipt": "Enviar comprobante por WhatsApp",
      "payment.receipt.aria": "Enviar comprobante por WhatsApp; se abrirá en una pestaña nueva",
      "payment.cancel": "Cancelar",
      "payment.receipt.message": "Hola Cordal Sur, adjunto el comprobante de mi abono por Mercado Pago. Reserva a nombre de: ___",
      "platform.eyebrow": "Encuentra Cordal Sur",
      "platform.title": "Reserva o síguenos",
      "link.airbnb.label": "Airbnb",
      "link.airbnb.detail": "Ver alojamiento y reservar",
      "link.booking.label": "Booking.com",
      "link.booking.detail": "Consultar fechas disponibles",
      "link.instagram.label": "Instagram",
      "link.instagram.detail": "Síguenos en @cordal_sur",
      "travel.eyebrow": "Antes de subir",
      "travel.title": "Prepara tu viaje",
      "travel.description": "Consulta las condiciones de la montaña y ubica el alojamiento antes de salir.",
      "link.forecast.label": "Pronóstico de nieve",
      "link.forecast.detail": "Snow-Forecast · Nevados de Chillán",
      "link.mountain.label": "Reporte oficial de montaña",
      "link.mountain.detail": "Información oficial de Nevados",
      "link.maps.label": "Cómo llegar",
      "link.maps.detail": "Condominio Andes Chillán en Maps",
      "share.default": "Compartir Cordal Sur",
      "share.text": "Conoce Cordal Sur en Andes Chillán.",
      "share.thanks": "¡Gracias por compartir!",
      "share.copied": "Enlace copiado",
      "share.error": "No fue posible copiar el enlace",
      "footer.text": "Cordal Sur · Condominio Andes Chillán · Las Trancas, Chile",
      "gallery.kicker": "Conoce el departamento",
      "gallery.title": "Galería Cordal Sur",
      "gallery.description": "38 fotografías agrupadas por ambiente.",
      "gallery.close": "Cerrar galería",
      "gallery.viewer.close": "Cerrar foto ampliada",
      "gallery.photo.alt": "{category} de Cordal Sur: {caption}",
      "gallery.expand": "Ampliar {description}",
      "noscript": "Activa JavaScript para ver las fotografías y abrir los enlaces de Cordal Sur.",
      "photo.principal.title": "Dormitorio principal",
      "photo.principal.0": "Vista general", "photo.principal.1": "Detalles del dormitorio",
      "photo.futon.title": "Dormitorio con futón",
      "photo.futon.0": "Futón como sofá", "photo.futon.1": "Vista del dormitorio", "photo.futon.2": "Iluminación natural", "photo.futon.3": "Espacio de guardado", "photo.futon.4": "Detalles del ambiente", "photo.futon.5": "Acceso al dormitorio", "photo.futon.6": "Zona de descanso", "photo.futon.7": "Rincón del dormitorio", "photo.futon.8": "Vista general", "photo.futon.9": "Futón preparado como cama",
      "photo.literas.title": "Dormitorio con literas",
      "photo.literas.0": "Vista del dormitorio", "photo.literas.1": "Literas", "photo.literas.2": "Escalera y protecciones", "photo.literas.3": "Iluminación natural", "photo.literas.4": "Espacio para descansar", "photo.literas.5": "Detalles del ambiente", "photo.literas.6": "Vista lateral", "photo.literas.7": "Acceso al dormitorio", "photo.literas.8": "Rincón de las literas", "photo.literas.9": "Vista general",
      "photo.banos.title": "Baños",
      "photo.banos.0": "Baño principal", "photo.banos.1": "Lavamanos y espejo", "photo.banos.2": "Ducha", "photo.banos.3": "Vista general", "photo.banos.4": "Segundo baño",
      "photo.cocina.title": "Cocina", "photo.cocina.0": "Cocina equipada", "photo.cocina.1": "Cubierta y almacenamiento",
      "photo.sala.title": "Sala", "photo.sala.0": "Sala de estar", "photo.sala.1": "Espacio para compartir",
      "photo.comedor.title": "Comedor", "photo.comedor.0": "Comedor", "photo.comedor.1": "Vista hacia la cocina",
      "photo.balcon.title": "Balcón", "photo.balcon.0": "Balcón y vista",
      "photo.exterior.title": "Exterior", "photo.exterior.0": "Exterior del condominio",
      "photo.piscina.title": "Piscina", "photo.piscina.0": "Piscina del condominio",
      "photo.entorno.title": "Entorno", "photo.entorno.0": "Camino nevado", "photo.entorno.1": "Atardecer en la cordillera"
    }),
    pt: Object.freeze({
      "page.title": "Cordal Sur · Andes Chillán",
      "page.description": "Cordal Sur: hospedagem para até 7 hóspedes no Condomínio Andes Chillán, em Las Trancas. Consulte a disponibilidade e prepare sua viagem.",
      "preferences.aria": "Preferências de visualização",
      "language.aria": "Seletor de idioma",
      "theme.aria": "Seletor de tema",
      "theme.light": "Usar tema claro",
      "theme.dark": "Usar tema escuro",
      "skip.main": "Ir para o conteúdo principal",
      "page.heading": "Cordal Sur, hospedagem em Andes Chillán",
      "hero.photos": "Fotografias da Cordal Sur",
      "carousel.controls": "Controles do carrossel",
      "carousel.previous": "Foto anterior",
      "carousel.next": "Próxima foto",
      "carousel.pause": "Pausar carrossel",
      "carousel.resume": "Retomar carrossel",
      "carousel.reduced": "Carrossel pausado pela preferência de movimento reduzido",
      "gallery.open": "Ver as 38 fotos",
      "hero.eyebrow": "Andes Chillán · Las Trancas",
      "hero.title": "Sua pausa perto da montanha",
      "hero.description": "Um refúgio acolhedor para descansar, compartilhar e despertar entre a floresta, a neve e o ar da cordilheira.",
      "hero.caption.bathroom": "Banheiro",
      "stay.features": "Características da hospedagem",
      "stay.guests": "Até 7 hóspedes",
      "stay.location": "Condomínio Andes Chillán",
      "contact.question": "Quais datas você tem em mente?",
      "contact.title": "Fale conosco pelo WhatsApp",
      "contact.detail": "Informe as datas e o número de hóspedes",
      "contact.aria": "Entrar em contato pelo WhatsApp",
      "contact.message": "Olá, Cordal Sur! Gostaria de consultar a disponibilidade. Minhas datas são de ___ a ___ e somos ___ hóspedes.",
      "availability.eyebrow": "Disponibilidade",
      "availability.title": "Encontre suas datas",
      "availability.description": "Consulte a disponibilidade consolidada dos nossos calendários de reserva.",
      "availability.loading": "Consultando disponibilidade…",
      "availability.refresh": "Atualizar disponibilidade",
      "availability.previous": "Mês anterior",
      "availability.next": "Próximo mês",
      "availability.calendar.aria": "Calendário público de disponibilidade",
      "availability.available": "Disponível",
      "availability.reserved": "Reservado",
      "availability.reserved.checkout": "Reservado; disponível apenas como data de saída",
      "availability.selected": "Selecionado",
      "availability.today": "Hoje",
      "availability.past": "Data passada",
      "availability.showPrices": "Mostrar preços",
      "availability.updated": "Atualizado em {date}",
      "availability.stale": "Mostrando os últimos dados disponíveis; eles podem estar desatualizados.",
      "availability.unavailable": "Não podemos confirmar a disponibilidade neste momento.",
      "availability.offline": "Sem conexão. Mantemos a última leitura disponível.",
      "availability.selectArrival": "Selecione a data de chegada.",
      "availability.selectDeparture": "Agora selecione a data de saída.",
      "availability.invalidRange": "O período atravessa uma noite reservada. Escolha outra saída.",
      "availability.arrival": "Chegada",
      "availability.departure": "Saída",
      "availability.nights.label": "Noites",
      "availability.night": "{count} noite",
      "availability.nights": "{count} noites",
      "availability.confirmed": "Datas disponíveis",
      "availability.clear": "Limpar seleção",
      "availability.consult": "Consultar estas datas pelo WhatsApp",
      "availability.disclaimer": "Esta consulta não constitui uma reserva. A disponibilidade e o valor final devem ser confirmados com a Cordal Sur.",
      "availability.weekday": "Dia de semana",
      "availability.weekend": "Fim de semana",
      "availability.estimate": "Subtotal estimado",
      "availability.whatsapp": "Olá, Cordal Sur! Gostaria de consultar a disponibilidade de {arrival} a {departure} ({nightLabel}). Somos ___ hóspedes.{price}",
      "availability.whatsapp.price": " Subtotal estimado: {total}, sujeito a confirmação.",
      "payment.kicker": "Pagamento seguro · Mercado Pago",
      "payment.title": "Faça um pagamento para a Cordal Sur",
      "payment.detail": "Digite o valor combinado e pague com segurança pelo Mercado Pago",
      "payment.open": "Abrir instruções para pagar à Cordal Sur",
      "payment.dialog.kicker": "Pagamento seguro",
      "payment.dialog.title": "Antes de pagar",
      "payment.dialog.close": "Fechar instruções de pagamento",
      "payment.dialog.description": "Você será direcionado ao canal de pagamento da Cordal Sur no Mercado Pago.",
      "payment.step.amount": "Digite apenas o valor combinado para a sua reserva.",
      "payment.step.review": "Confira o valor antes de escolher a forma de pagamento.",
      "payment.step.receipt": "Após concluir, envie o comprovante pelo WhatsApp.",
      "payment.destination": "Destino seguro:",
      "payment.continue": "Continuar para o Mercado Pago",
      "payment.continue.aria": "Continuar para o Mercado Pago; será aberto em uma nova aba",
      "payment.receipt": "Enviar comprovante pelo WhatsApp",
      "payment.receipt.aria": "Enviar comprovante pelo WhatsApp; será aberto em uma nova aba",
      "payment.cancel": "Cancelar",
      "payment.receipt.message": "Olá, Cordal Sur! Estou enviando o comprovante do meu pagamento pelo Mercado Pago. Reserva em nome de: ___",
      "platform.eyebrow": "Encontre a Cordal Sur",
      "platform.title": "Reserve ou siga-nos",
      "link.airbnb.label": "Airbnb", "link.airbnb.detail": "Ver a hospedagem e reservar",
      "link.booking.label": "Booking.com", "link.booking.detail": "Consultar datas disponíveis",
      "link.instagram.label": "Instagram", "link.instagram.detail": "Siga-nos em @cordal_sur",
      "travel.eyebrow": "Antes de subir",
      "travel.title": "Prepare sua viagem",
      "travel.description": "Consulte as condições da montanha e localize a hospedagem antes de sair.",
      "link.forecast.label": "Previsão de neve", "link.forecast.detail": "Snow-Forecast · Nevados de Chillán",
      "link.mountain.label": "Relatório oficial da montanha", "link.mountain.detail": "Informações oficiais de Nevados",
      "link.maps.label": "Como chegar", "link.maps.detail": "Condomínio Andes Chillán no Maps",
      "share.default": "Compartilhar Cordal Sur", "share.text": "Conheça a Cordal Sur em Andes Chillán.",
      "share.thanks": "Obrigado por compartilhar!", "share.copied": "Link copiado", "share.error": "Não foi possível copiar o link",
      "footer.text": "Cordal Sur · Condomínio Andes Chillán · Las Trancas, Chile",
      "gallery.kicker": "Conheça o apartamento", "gallery.title": "Galeria Cordal Sur", "gallery.description": "38 fotografias agrupadas por ambiente.",
      "gallery.close": "Fechar galeria", "gallery.viewer.close": "Fechar foto ampliada",
      "gallery.photo.alt": "{category} da Cordal Sur: {caption}", "gallery.expand": "Ampliar {description}",
      "noscript": "Ative o JavaScript para ver as fotografias e abrir os links da Cordal Sur.",
      "photo.principal.title": "Quarto principal", "photo.principal.0": "Vista geral", "photo.principal.1": "Detalhes do quarto",
      "photo.futon.title": "Quarto com futon", "photo.futon.0": "Futon como sofá", "photo.futon.1": "Vista do quarto", "photo.futon.2": "Iluminação natural", "photo.futon.3": "Espaço de armazenamento", "photo.futon.4": "Detalhes do ambiente", "photo.futon.5": "Acesso ao quarto", "photo.futon.6": "Área de descanso", "photo.futon.7": "Canto do quarto", "photo.futon.8": "Vista geral", "photo.futon.9": "Futon preparado como cama",
      "photo.literas.title": "Quarto com beliches", "photo.literas.0": "Vista do quarto", "photo.literas.1": "Beliches", "photo.literas.2": "Escada e proteções", "photo.literas.3": "Iluminação natural", "photo.literas.4": "Espaço para descansar", "photo.literas.5": "Detalhes do ambiente", "photo.literas.6": "Vista lateral", "photo.literas.7": "Acesso ao quarto", "photo.literas.8": "Canto dos beliches", "photo.literas.9": "Vista geral",
      "photo.banos.title": "Banheiros", "photo.banos.0": "Banheiro principal", "photo.banos.1": "Pia e espelho", "photo.banos.2": "Chuveiro", "photo.banos.3": "Vista geral", "photo.banos.4": "Segundo banheiro",
      "photo.cocina.title": "Cozinha", "photo.cocina.0": "Cozinha equipada", "photo.cocina.1": "Bancada e armazenamento",
      "photo.sala.title": "Sala", "photo.sala.0": "Sala de estar", "photo.sala.1": "Espaço para compartilhar",
      "photo.comedor.title": "Sala de jantar", "photo.comedor.0": "Sala de jantar", "photo.comedor.1": "Vista para a cozinha",
      "photo.balcon.title": "Varanda", "photo.balcon.0": "Varanda e vista",
      "photo.exterior.title": "Exterior", "photo.exterior.0": "Exterior do condomínio",
      "photo.piscina.title": "Piscina", "photo.piscina.0": "Piscina do condomínio",
      "photo.entorno.title": "Arredores", "photo.entorno.0": "Caminho com neve", "photo.entorno.1": "Pôr do sol na cordilheira"
    }),
    en: Object.freeze({
      "page.title": "Cordal Sur · Andes Chillán",
      "page.description": "Cordal Sur: accommodation for up to 7 guests at Andes Chillán Condominium in Las Trancas. Check availability and prepare your trip.",
      "preferences.aria": "Display preferences",
      "language.aria": "Language selector",
      "theme.aria": "Theme selector",
      "theme.light": "Use light theme",
      "theme.dark": "Use dark theme",
      "skip.main": "Skip to main content",
      "page.heading": "Cordal Sur accommodation in Andes Chillán",
      "hero.photos": "Cordal Sur photographs",
      "carousel.controls": "Carousel controls",
      "carousel.previous": "Previous photo",
      "carousel.next": "Next photo",
      "carousel.pause": "Pause carousel",
      "carousel.resume": "Resume carousel",
      "carousel.reduced": "Carousel paused due to reduced motion preference",
      "gallery.open": "View all 38 photos",
      "hero.eyebrow": "Andes Chillán · Las Trancas",
      "hero.title": "Your mountain getaway",
      "hero.description": "A welcoming retreat to rest, spend time together and wake up surrounded by forest, snow and mountain air.",
      "hero.caption.bathroom": "Bathroom",
      "stay.features": "Accommodation features",
      "stay.guests": "Up to 7 guests",
      "stay.location": "Andes Chillán Condominium",
      "contact.question": "Which dates do you have in mind?",
      "contact.title": "Contact us on WhatsApp",
      "contact.detail": "Tell us your dates and number of guests",
      "contact.aria": "Contact Cordal Sur on WhatsApp",
      "contact.message": "Hello Cordal Sur, I'd like to check availability. My dates are from ___ to ___ and there will be ___ guests.",
      "availability.eyebrow": "Availability",
      "availability.title": "Find your dates",
      "availability.description": "Check consolidated availability from our reservation calendars.",
      "availability.loading": "Checking availability…",
      "availability.refresh": "Refresh availability",
      "availability.previous": "Previous month",
      "availability.next": "Next month",
      "availability.calendar.aria": "Public availability calendar",
      "availability.available": "Available",
      "availability.reserved": "Reserved",
      "availability.reserved.checkout": "Reserved; available only as a checkout date",
      "availability.selected": "Selected",
      "availability.today": "Today",
      "availability.past": "Past date",
      "availability.showPrices": "Show prices",
      "availability.updated": "Updated {date}",
      "availability.stale": "Showing the latest available data; it may be out of date.",
      "availability.unavailable": "We cannot confirm availability right now.",
      "availability.offline": "You are offline. We are keeping the latest available reading.",
      "availability.selectArrival": "Select your arrival date.",
      "availability.selectDeparture": "Now select your departure date.",
      "availability.invalidRange": "This range crosses a reserved night. Choose another checkout date.",
      "availability.arrival": "Arrival",
      "availability.departure": "Departure",
      "availability.nights.label": "Nights",
      "availability.night": "{count} night",
      "availability.nights": "{count} nights",
      "availability.confirmed": "Dates available",
      "availability.clear": "Clear selection",
      "availability.consult": "Ask about these dates on WhatsApp",
      "availability.disclaimer": "This enquiry is not a reservation. Availability and the final price must be confirmed with Cordal Sur.",
      "availability.weekday": "Weeknight",
      "availability.weekend": "Weekend",
      "availability.estimate": "Estimated subtotal",
      "availability.whatsapp": "Hello Cordal Sur, I'd like to check availability from {arrival} to {departure} ({nightLabel}). There will be ___ guests.{price}",
      "availability.whatsapp.price": " Estimated subtotal: {total}, subject to confirmation.",
      "payment.kicker": "Secure payment · Mercado Pago",
      "payment.title": "Pay Cordal Sur",
      "payment.detail": "Enter the agreed amount and pay securely through Mercado Pago",
      "payment.open": "Open instructions to pay Cordal Sur",
      "payment.dialog.kicker": "Secure payment",
      "payment.dialog.title": "Before you pay",
      "payment.dialog.close": "Close payment instructions",
      "payment.dialog.description": "You will be directed to Cordal Sur's payment channel on Mercado Pago.",
      "payment.step.amount": "Enter only the amount agreed for your reservation.",
      "payment.step.review": "Check the amount before choosing your payment method.",
      "payment.step.receipt": "When you finish, send the receipt through WhatsApp.",
      "payment.destination": "Secure destination:",
      "payment.continue": "Continue to Mercado Pago",
      "payment.continue.aria": "Continue to Mercado Pago; opens in a new tab",
      "payment.receipt": "Send receipt through WhatsApp",
      "payment.receipt.aria": "Send receipt through WhatsApp; opens in a new tab",
      "payment.cancel": "Cancel",
      "payment.receipt.message": "Hello Cordal Sur, I'm attaching the receipt for my Mercado Pago payment. Reservation name: ___",
      "platform.eyebrow": "Find Cordal Sur", "platform.title": "Book or follow us",
      "link.airbnb.label": "Airbnb", "link.airbnb.detail": "View the accommodation and book",
      "link.booking.label": "Booking.com", "link.booking.detail": "Check available dates",
      "link.instagram.label": "Instagram", "link.instagram.detail": "Follow us at @cordal_sur",
      "travel.eyebrow": "Before heading up", "travel.title": "Prepare your trip",
      "travel.description": "Check mountain conditions and locate the accommodation before you leave.",
      "link.forecast.label": "Snow forecast", "link.forecast.detail": "Snow-Forecast · Nevados de Chillán",
      "link.mountain.label": "Official mountain report", "link.mountain.detail": "Official information from Nevados",
      "link.maps.label": "Directions", "link.maps.detail": "Andes Chillán Condominium on Maps",
      "share.default": "Share Cordal Sur", "share.text": "Discover Cordal Sur in Andes Chillán.",
      "share.thanks": "Thanks for sharing!", "share.copied": "Link copied", "share.error": "The link could not be copied",
      "footer.text": "Cordal Sur · Andes Chillán Condominium · Las Trancas, Chile",
      "gallery.kicker": "Explore the apartment", "gallery.title": "Cordal Sur gallery", "gallery.description": "38 photographs grouped by room and area.",
      "gallery.close": "Close gallery", "gallery.viewer.close": "Close enlarged photo",
      "gallery.photo.alt": "{category} at Cordal Sur: {caption}", "gallery.expand": "Enlarge {description}",
      "noscript": "Enable JavaScript to view the photographs and open Cordal Sur links.",
      "photo.principal.title": "Main bedroom", "photo.principal.0": "General view", "photo.principal.1": "Bedroom details",
      "photo.futon.title": "Futon bedroom", "photo.futon.0": "Futon as a sofa", "photo.futon.1": "Bedroom view", "photo.futon.2": "Natural light", "photo.futon.3": "Storage space", "photo.futon.4": "Room details", "photo.futon.5": "Bedroom entrance", "photo.futon.6": "Rest area", "photo.futon.7": "Bedroom corner", "photo.futon.8": "General view", "photo.futon.9": "Futon prepared as a bed",
      "photo.literas.title": "Bunk bedroom", "photo.literas.0": "Bedroom view", "photo.literas.1": "Bunk beds", "photo.literas.2": "Ladder and guard rails", "photo.literas.3": "Natural light", "photo.literas.4": "Space to rest", "photo.literas.5": "Room details", "photo.literas.6": "Side view", "photo.literas.7": "Bedroom entrance", "photo.literas.8": "Bunk bed corner", "photo.literas.9": "General view",
      "photo.banos.title": "Bathrooms", "photo.banos.0": "Main bathroom", "photo.banos.1": "Sink and mirror", "photo.banos.2": "Shower", "photo.banos.3": "General view", "photo.banos.4": "Second bathroom",
      "photo.cocina.title": "Kitchen", "photo.cocina.0": "Equipped kitchen", "photo.cocina.1": "Countertop and storage",
      "photo.sala.title": "Living room", "photo.sala.0": "Living room", "photo.sala.1": "Shared space",
      "photo.comedor.title": "Dining room", "photo.comedor.0": "Dining room", "photo.comedor.1": "View toward the kitchen",
      "photo.balcon.title": "Balcony", "photo.balcon.0": "Balcony and view",
      "photo.exterior.title": "Exterior", "photo.exterior.0": "Condominium exterior",
      "photo.piscina.title": "Pool", "photo.piscina.0": "Condominium pool",
      "photo.entorno.title": "Surroundings", "photo.entorno.0": "Snowy road", "photo.entorno.1": "Sunset over the mountains"
    })
  });

  const listeners = new Set();
  const readStored = (key, supported, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return supported.includes(value) ? value : fallback;
    } catch {
      return fallback;
    }
  };
  const getLanguage = () => readStored(LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, FALLBACK_LANGUAGE);
  const getTheme = () => readStored(THEME_STORAGE_KEY, SUPPORTED_THEMES, FALLBACK_THEME);
  const t = (key, language = getLanguage()) => TRANSLATIONS[language]?.[key] ?? TRANSLATIONS[FALLBACK_LANGUAGE][key] ?? key;
  const format = (key, values = {}, language = getLanguage()) => t(key, language).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
  );

  const updatePressedStates = (selector, attribute, value) => {
    document.querySelectorAll(selector).forEach((button) => {
      button.setAttribute("aria-pressed", String(button.getAttribute(attribute) === value));
    });
  };

  const applyLanguage = (language = getLanguage()) => {
    const next = SUPPORTED_LANGUAGES.includes(language) ? language : FALLBACK_LANGUAGE;
    document.documentElement.lang = HTML_LANGUAGES[next];
    document.documentElement.dataset.language = next;
    document.title = t("page.title", next);
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("page.description", next));
    document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n, next); });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => { element.setAttribute("aria-label", t(element.dataset.i18nAria, next)); });
    document.querySelectorAll("[data-i18n-alt]").forEach((element) => { element.setAttribute("alt", t(element.dataset.i18nAlt, next)); });
    updatePressedStates("[data-language-option]", "data-language-option", next);
    document.documentElement.classList.add("i18n-ready");
    return next;
  };

  const applyTheme = (theme = getTheme()) => {
    const next = SUPPORTED_THEMES.includes(theme) ? theme : FALLBACK_THEME;
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[next]);
    updatePressedStates("[data-theme-option]", "data-theme-option", next);
    return next;
  };

  const notify = (changed) => {
    const state = Object.freeze({ language: getLanguage(), theme: getTheme(), changed });
    listeners.forEach((listener) => {
      try { listener(state); } catch { /* Keep other listeners alive. */ }
    });
  };

  const setLanguage = (language) => {
    const next = SUPPORTED_LANGUAGES.includes(language) ? language : FALLBACK_LANGUAGE;
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* Storage is optional. */ }
    applyLanguage(next);
    notify("language");
  };

  const setTheme = (theme) => {
    const next = SUPPORTED_THEMES.includes(theme) ? theme : FALLBACK_THEME;
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* Storage is optional. */ }
    applyTheme(next);
    notify("theme");
  };

  const subscribe = (listener) => {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const initializeControls = () => {
    document.querySelector("#language-selector")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-language-option]");
      if (button) setLanguage(button.dataset.languageOption);
    });
    document.querySelector("#theme-selector")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-theme-option]");
      if (button) setTheme(button.dataset.themeOption);
    });
    applyLanguage();
    applyTheme();
  };

  window.CS_LINKTREE_PREFERENCES = Object.freeze({
    LANGUAGE_STORAGE_KEY,
    THEME_STORAGE_KEY,
    supportedLanguages: SUPPORTED_LANGUAGES,
    supportedThemes: SUPPORTED_THEMES,
    translations: TRANSLATIONS,
    getLanguage,
    setLanguage,
    getTheme,
    setTheme,
    applyLanguage,
    applyTheme,
    t,
    format,
    subscribe
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeControls, { once: true });
  else initializeControls();
})();
