import pptxgen from 'pptxgenjs';
import { PresentationData, DesignTheme } from '../types';

export async function exportToPptx(presentation: PresentationData) {
  const pres = new pptxgen();

  // 16:9 widescreen layout
  pres.layout = 'LAYOUT_16x9';
  pres.title = presentation.title;
  pres.subject = presentation.subject || 'Taqdimot & Referat';
  pres.author = presentation.studentName || '@TAQDIMIY_BOT';

  // Theme styles
  const themeStyles: Record<DesignTheme, { bg: string; text: string; accent: string; cardBg: string; frameColor: string }> = {
    'Modern Dark': {
      bg: '0B1120', // deep slate
      text: 'F8FAFC',
      accent: '38BDF8', // sky
      cardBg: '1E293B',
      frameColor: '1E3A8A',
    },
    'Minimalist Light': {
      bg: 'F8FAFC',
      text: '0F172A',
      accent: '2563EB',
      cardBg: 'FFFFFF',
      frameColor: 'CBD5E1',
    },
    'Academic Navy': {
      bg: '0A192F',
      text: 'F1F5F9',
      accent: '64FFDA',
      cardBg: '112240',
      frameColor: '1E3A5F',
    },
    'Emerald Tech': {
      bg: '064E3B',
      text: 'ECFDF5',
      accent: '34D399',
      cardBg: '065F46',
      frameColor: '047857',
    },
    'Gold Luxury': {
      bg: '1C1917',
      text: 'FAF5FF',
      accent: 'F59E0B',
      cardBg: '292524',
      frameColor: '78350F',
    }
  };

  const style = themeStyles[presentation.theme] || themeStyles['Modern Dark'];
  const isPro = presentation.tier === 'PRO';

  presentation.slides.forEach((slideData, idx) => {
    const slide = pres.addSlide();
    slide.background = { color: style.bg };

    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }

    // PRO TIER MODERN FRAME: Add decorative frame borders around the slide
    if (isPro) {
      // Top accent frame line
      slide.addShape(pres.ShapeType.rect, {
        x: 0.5,
        y: 0.4,
        w: 12.33,
        h: 0.04,
        fill: { color: style.accent },
        line: { color: style.accent }
      });
      // Bottom accent frame line
      slide.addShape(pres.ShapeType.rect, {
        x: 0.5,
        y: 7.1,
        w: 12.33,
        h: 0.04,
        fill: { color: style.frameColor },
        line: { color: style.frameColor }
      });
      // Left vertical accent frame
      slide.addShape(pres.ShapeType.rect, {
        x: 0.5,
        y: 0.4,
        w: 0.04,
        h: 6.74,
        fill: { color: style.accent },
        line: { color: style.accent }
      });
      // Right vertical accent frame
      slide.addShape(pres.ShapeType.rect, {
        x: 12.8,
        y: 0.4,
        w: 0.04,
        h: 6.74,
        fill: { color: style.frameColor },
        line: { color: style.frameColor }
      });
    }

    if (idx === 0) {
      // Title / Cover Slide
      slide.addText(slideData.title, {
        x: 1.0,
        y: 1.8,
        w: 11.3,
        h: 2.2,
        fontSize: 34,
        fontFace: 'Arial',
        color: style.text,
        bold: true,
        align: 'left',
        valign: 'middle',
      });

      if (slideData.subtitle) {
        slide.addText(slideData.subtitle, {
          x: 1.0,
          y: 4.1,
          w: 11.3,
          h: 0.8,
          fontSize: 18,
          fontFace: 'Arial',
          color: style.accent,
          align: 'left',
        });
      }

      // Metadata info lines
      const metaLines = slideData.contentPoints.map(p => ({
        text: `${p}\n`,
        options: { fontSize: 13, color: '94A3B8' }
      }));

      if (metaLines.length > 0) {
        slide.addText(metaLines, {
          x: 1.0,
          y: 5.0,
          w: 11.3,
          h: 1.6,
          fontFace: 'Arial',
          align: 'left',
        });
      }
    } else {
      // Content Slide Header
      slide.addShape(pres.ShapeType.rect, {
        x: 1.0,
        y: 0.8,
        w: 0.15,
        h: 0.7,
        fill: { color: style.accent },
        line: { color: style.accent }
      });

      slide.addText(slideData.title, {
        x: 1.3,
        y: 0.8,
        w: 10.8,
        h: 0.8,
        fontSize: 23,
        fontFace: 'Arial',
        color: style.text,
        bold: true,
        valign: 'middle',
      });

      if (slideData.subtitle) {
        slide.addText(slideData.subtitle, {
          x: 1.3,
          y: 1.5,
          w: 10.8,
          h: 0.4,
          fontSize: 12,
          fontFace: 'Arial',
          color: '94A3B8',
        });
      }

      // Main content bullets
      const bullets = slideData.contentPoints.map(pt => ({
        text: pt,
        options: {
          fontSize: presentation.fontSize === 'Maksimal' ? 17 : presentation.fontSize === 'Ko\'p' ? 15 : 13,
          color: style.text,
          bullet: true,
          paraSpaceAfter: 12,
        }
      }));

      // Content box width adjusts if there's a side card / image
      const contentWidth = isPro || slideData.highlightText ? 7.2 : 11.0;

      slide.addText(bullets, {
        x: 1.0,
        y: 2.2,
        w: contentWidth,
        h: 4.3,
        fontFace: 'Arial',
        valign: 'top',
      });

      // PRO TIER VISUAL CARD & CHARACTER HIGHLIGHT / SLIDE IMAGE
      if (slideData.imageUrl) {
        try {
          if (slideData.imageUrl.startsWith('data:image')) {
            slide.addImage({
              data: slideData.imageUrl,
              x: 8.6,
              y: 2.1,
              w: 3.8,
              h: 2.3,
            });
          } else if (slideData.imageUrl.startsWith('http') || slideData.imageUrl.startsWith('/')) {
            slide.addImage({
              path: slideData.imageUrl,
              x: 8.6,
              y: 2.1,
              w: 3.8,
              h: 2.3,
            });
          }
        } catch (imgErr) {
          console.warn('Could not add image to PPTX slide:', imgErr);
        }

        // Frame line around image
        slide.addShape(pres.ShapeType.rect, {
          x: 8.58,
          y: 2.08,
          w: 3.84,
          h: 2.34,
          fill: { color: '000000', transparency: 100 },
          line: { color: style.accent, width: 1.5 },
        });

        // Caption / Character card below image
        if (slideData.characterName || slideData.highlightText) {
          slide.addShape(pres.ShapeType.roundRect, {
            x: 8.6,
            y: 4.55,
            w: 3.8,
            h: 1.8,
            fill: { color: style.cardBg },
            line: { color: style.accent, width: 1 },
          });

          const captionText = slideData.characterName 
            ? `${slideData.characterName} (${slideData.characterRole || 'Ekspert'}):\n"${slideData.characterQuote || slideData.highlightText || ''}"`
            : `Asosiy xulosa:\n"${slideData.highlightText || ''}"`;

          slide.addText(captionText, {
            x: 8.7,
            y: 4.65,
            w: 3.6,
            h: 1.6,
            fontSize: 9.5,
            fontFace: 'Arial',
            color: style.text,
            italic: true,
            valign: 'middle',
          });
        }
      } else if (slideData.highlightText || isPro || slideData.characterName) {
        slide.addShape(pres.ShapeType.roundRect, {
          x: 8.6,
          y: 2.1,
          w: 3.8,
          h: 3.8,
          fill: { color: style.cardBg },
          line: { color: style.accent, width: 1.5 }
        });

        // Top tag
        slide.addText(isPro ? '⭐ PRO · MAVZU PERSONAJI' : 'ASOSIY TA\'KID', {
          x: 8.8,
          y: 2.3,
          w: 3.4,
          h: 0.35,
          fontSize: 10,
          fontFace: 'Arial',
          bold: true,
          color: style.accent,
        });

        // Character Name & Role if available
        if (slideData.characterName) {
          slide.addText(`${slideData.characterName}\n(${slideData.characterRole || 'Soha mutaxassisi'})`, {
            x: 8.8,
            y: 2.7,
            w: 3.4,
            h: 0.6,
            fontSize: 11,
            fontFace: 'Arial',
            bold: true,
            color: 'F1F5F9',
          });
        }

        const quoteY = slideData.characterName ? 3.4 : 2.8;
        const quoteH = slideData.characterName ? 2.3 : 2.8;

        slide.addText(slideData.characterQuote || slideData.highlightText || 'Zamonaviy ilmiy va amaliy tahlillar', {
          x: 8.8,
          y: quoteY,
          w: 3.4,
          h: quoteH,
          fontSize: 11.5,
          fontFace: 'Arial',
          color: style.text,
          italic: true,
          valign: 'middle',
        });
      }

      // Slide number footer
      slide.addText(`${slideData.slideNumber} / ${presentation.slides.length}`, {
        x: 11.5,
        y: 6.6,
        w: 1.2,
        h: 0.4,
        fontSize: 11,
        fontFace: 'Arial',
        color: '64748B',
        align: 'right',
      });

      // Official branding footer
      slide.addText('@TAQDIMIY_BOT · Taqdimot & Referat', {
        x: 1.0,
        y: 6.6,
        w: 6.0,
        h: 0.4,
        fontSize: 10,
        fontFace: 'Arial',
        color: '64748B',
      });
    }
  });

  const safeTitle = presentation.title.replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '_').substring(0, 25);
  await pres.writeFile({ fileName: `${safeTitle}_TAQDIMIY_BOT.pptx` });
}
