(function($) {
  $.fn.mauGallery = function(options) {
    options = $.extend($.fn.mauGallery.defaults, options);
    const tagsCollection = [];
    
    return this.each(function() {
      const $this = $(this);
      $.fn.mauGallery.methods.createRowWrapper($this);

      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox($this, options.lightboxId, options.navigation);
      }
      $.fn.mauGallery.listeners($this, options);

      $this.children(".gallery-item").each(function() {
        const $item = $(this);
        $.fn.mauGallery.methods.responsiveImageItem($item);
        $.fn.mauGallery.methods.moveItemInRowWrapper($item);
        $.fn.mauGallery.methods.wrapItemInColumn($item, options.columns);

        const theTag = $item.data("gallery-tag");
        if (options.showTags && theTag !== undefined && !tagsCollection.includes(theTag)) {
          tagsCollection.push(theTag);
        }
      });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags($this, options.tagsPosition, tagsCollection);
      }

      $this.fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function(gallery, options) {
    gallery.on("click", ".gallery-item", function() {
      if (options.lightBox && $(this).is("img")) {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    gallery.on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    gallery.on("click", ".mg-prev", () => $.fn.mauGallery.methods.prevImage(options.lightboxId));
    gallery.on("click", ".mg-next", () => $.fn.mauGallery.methods.nextImage(options.lightboxId));

    // Adding keyboard accessibility for lightbox navigation
    $(document).on("keydown", function(e) {
      if (e.key === "ArrowLeft") {
        $.fn.mauGallery.methods.prevImage(options.lightboxId);
      } else if (e.key === "ArrowRight") {
        $.fn.mauGallery.methods.nextImage(options.lightboxId);
      } else if (e.key === "Escape") {
        $(`#${options.lightboxId}`).modal("hide");
      }
    });
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (typeof columns === "number") {
        element.wrap(`<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`);
      } else if (typeof columns === "object") {
        let columnClasses = "";
        for (let size in columns) {
          columnClasses += ` col-${size}-${Math.ceil(12 / columns[size])}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.is("img")) {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage(lightboxId) {
      const activeImage = $("img.gallery-item").filter(function() {
        return $(this).attr("src") === $(".lightboxImage").attr("src");
      });

      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = activeTag === "all" ? $(".item-column img") : $(`.item-column img[data-gallery-tag="${activeTag}"]`);
      
      const index = imagesCollection.index(activeImage);
      const prev = imagesCollection.get(index - 1) || imagesCollection.last();
      
      $(".lightboxImage").attr("src", $(prev).attr("src"));
    },
    nextImage(lightboxId) {
      const activeImage = $("img.gallery-item").filter(function() {
        return $(this).attr("src") === $(".lightboxImage").attr("src");
      });

      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = activeTag === "all" ? $(".item-column img") : $(`.item-column img[data-gallery-tag="${activeTag}"]`);
      
      const index = imagesCollection.index(activeImage);
      const next = imagesCollection.get(index + 1) || imagesCollection.first();
      
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`
        <div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : ''}
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : ''}
              </div>
            </div>
          </div>
        </div>`);
    },
    showItemTags(gallery, position, tags) {
      let tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      tags.forEach(tag => {
        tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`;
      });

      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      position === "bottom" ? gallery.append(tagsRow) : position === "top" ? gallery.prepend(tagsRow) : console.error(`Unknown tags position: ${position}`);
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) return;
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active active-tag");

      const tag = $(this).data("images-toggle");
      $(".gallery-item").each(function() {
        const $item = $(this).parents(".item-column");
        tag === "all" || $(this).data("gallery-tag") === tag ? $item.show(300) : $item.hide();
      });
    }
  };
})(jQuery);
