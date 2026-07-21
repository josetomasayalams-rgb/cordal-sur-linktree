"use strict";

(() => {
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
      return Object.freeze({
        id: basename,
        groupId: group.id,
        categoryKey: group.titleKey,
        captionKey: group.captionKey,
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
