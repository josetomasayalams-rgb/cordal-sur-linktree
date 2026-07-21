"use strict";

(() => {
  const photoDimensions = Object.freeze({
    "01-sala-01": Object.freeze([1448, 1086]),
    "01-sala-02": Object.freeze([1672, 941]),
    "02-cocina-completa-01": Object.freeze([941, 1672]),
    "02-cocina-completa-02": Object.freeze([1086, 1448]),
    "02-cocina-completa-03": Object.freeze([941, 1672]),
    "02-cocina-completa-04": Object.freeze([1672, 941]),
    "03-comedor-01": Object.freeze([1086, 1449]),
    "03-comedor-02": Object.freeze([941, 1672]),
    "04-habitacion-1-01": Object.freeze([1024, 1536]),
    "04-habitacion-1-02": Object.freeze([941, 1672]),
    "04-habitacion-1-03": Object.freeze([941, 1672]),
    "04-habitacion-1-05": Object.freeze([941, 1672]),
    "04-habitacion-1-06": Object.freeze([941, 1672]),
    "04-habitacion-1-07": Object.freeze([941, 1672]),
    "05-habitacion-2-01": Object.freeze([941, 1672]),
    "05-habitacion-2-02": Object.freeze([941, 1672]),
    "05-habitacion-2-03": Object.freeze([941, 1672]),
    "05-habitacion-2-04": Object.freeze([1014, 1551]),
    "05-habitacion-2-05": Object.freeze([941, 1672]),
    "05-habitacion-2-06": Object.freeze([941, 1672]),
    "05-habitacion-2-07": Object.freeze([941, 1672]),
    "06-habitacion-3-01": Object.freeze([1023, 1537]),
    "06-habitacion-3-02": Object.freeze([941, 1672]),
    "07-bano-completo-1-01": Object.freeze([941, 1672]),
    "07-bano-completo-1-02": Object.freeze([941, 1672]),
    "08-bano-completo-2-01": Object.freeze([941, 1672]),
    "08-bano-completo-2-02": Object.freeze([1672, 941]),
    "09-balcon-01": Object.freeze([1086, 1449]),
    "10-exterior-01": Object.freeze([1085, 1449]),
    "10-exterior-02": Object.freeze([1086, 1448]),
    "10-exterior-03": Object.freeze([1536, 1024]),
    "10-exterior-04": Object.freeze([1536, 1024]),
    "10-exterior-05": Object.freeze([1536, 1024]),
    "10-exterior-06": Object.freeze([1086, 1448]),
    "11-entrada-guardabotas-01": Object.freeze([941, 1672])
  });

  const groups = Object.freeze([
    Object.freeze({ id: "sala", titleKey: "gallery.sala", captionKey: "gallery.sala.caption", slug: "01-sala", count: 2 }),
    Object.freeze({ id: "cocina", titleKey: "gallery.cocina", captionKey: "gallery.cocina.caption", slug: "02-cocina-completa", count: 4 }),
    Object.freeze({ id: "comedor", titleKey: "gallery.comedor", captionKey: "gallery.comedor.caption", slug: "03-comedor", count: 2 }),
    Object.freeze({ id: "habitacion1", titleKey: "gallery.habitacion1", captionKey: "gallery.habitacion1.caption", slug: "04-habitacion-1", count: 6, photoNumbers: Object.freeze([1, 3, 2, 5, 6, 7]) }),
    Object.freeze({ id: "habitacion2", titleKey: "gallery.habitacion2", captionKey: "gallery.habitacion2.caption", slug: "05-habitacion-2", count: 7, photoNumbers: Object.freeze([5, 1, 2, 3, 4, 6, 7]) }),
    Object.freeze({ id: "habitacion3", titleKey: "gallery.habitacion3", captionKey: "gallery.habitacion3.caption", slug: "06-habitacion-3", count: 2, photoNumbers: Object.freeze([1, 2]) }),
    Object.freeze({ id: "bano1", titleKey: "gallery.bano1", captionKey: "gallery.bano1.caption", slug: "07-bano-completo-1", count: 2 }),
    Object.freeze({ id: "bano2", titleKey: "gallery.bano2", captionKey: "gallery.bano2.caption", slug: "08-bano-completo-2", count: 2 }),
    Object.freeze({ id: "entrada", titleKey: "gallery.entrada", captionKey: "gallery.entrada.caption", slug: "11-entrada-guardabotas", count: 1 }),
    Object.freeze({ id: "balcon", titleKey: "gallery.balcon", captionKey: "gallery.balcon.caption", slug: "09-balcon", count: 1 }),
    Object.freeze({ id: "exterior", titleKey: "gallery.exterior", captionKey: "gallery.exterior.caption", slug: "10-exterior", count: 6 })
  ]);

  const photos = Object.freeze(groups.flatMap((group) =>
    (group.photoNumbers || Array.from({ length: group.count }, (_, index) => index + 1)).map((photoNumber) => {
      const basename = `${group.slug}-${String(photoNumber).padStart(2, "0")}`;
      const [width, height] = photoDimensions[basename];
      return Object.freeze({
        id: basename,
        groupId: group.id,
        categoryKey: group.titleKey,
        captionKey: group.captionKey,
        width,
        height,
        src: `assets/photos/${basename}.webp`,
        thumbnail: `assets/photos/thumbs/${basename}.webp`
      });
    })
  ));

  // Interleave categories so the cover can travel through the complete
  // collection without showing a long block from the same room.
  const previewOrder = Object.freeze(Array.from(
    { length: Math.max(...groups.map(({ count }) => count)) },
    (_, round) => groups
      .map(({ id }) => photos.filter(({ groupId }) => groupId === id)[round]?.id)
      .filter(Boolean)
  ).flat());

  const arrau = Object.freeze({
    id: "arrau",
    name: "Arrau",
    brand: "Cordal Sur",
    locationKey: "property.arrau.location",
    storyKey: "property.arrau.story",
    guestsKey: "stay.guests",
    accommodationKey: "stay.location",
    groups,
    photos,
    previewOrder
  });

  window.CS_LINKTREE_PROPERTIES = Object.freeze([arrau]);
})();
