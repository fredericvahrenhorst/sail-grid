import sanitizeHtml from 'sanitize-html';

const allowedTags = ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'h2', 'h3'];
export function sanitizeBookingInfo(html) {
    return sanitizeHtml(html, {
        allowedTags,
        allowedAttributes: {
            a: ['href', 'target', 'rel'],
        },
        allowedSchemes: ['https', 'http', 'mailto'],
        transformTags: {
            a: (tagName, attribs) => ({
                tagName,
                attribs: {
                    ...attribs,
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            }),
        },
    });
}
