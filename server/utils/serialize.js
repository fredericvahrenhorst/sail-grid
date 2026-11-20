export function serializeBoat(boat) {
    return {
        id: String(boat._id),
        name: boat.name || '',
        description: boat.description || '',
        imageUrl: boat.imageUrl || '',
        color: boat.color || '#334155',
        active: boat.active !== false,
        sortOrder: boat.sortOrder || 0,
    };
}
export function serializeBooking(booking) {
    const boat = booking.boatId && typeof booking.boatId === 'object' && 'name' in booking.boatId
        ? booking.boatId
        : null;
    return {
        id: String(booking._id),
        boatId: boat?._id ? String(boat._id) : String(booking.boatId),
        boatName: boat?.name || t('errors.unknownBoat'),
        boatColor: boat?.color || '#334155',
        memberName: booking.memberName || '',
        notes: booking.notes || '',
        route: booking.route || '',
        start: booking.start.toISOString(),
        end: booking.end.toISOString(),
        allDay: Boolean(booking.allDay),
        createdAt: (booking.createdAt || booking.start).toISOString(),
    };
}
export function serializeSettings(setting) {
    return {
        bookingInfoText: setting.bookingInfoText || '',
        notifyEnabled: Boolean(setting.notifyEnabled),
        siteName: setting.siteName || '',
        clubName: setting.clubName || '',
        metaTitle: setting.metaTitle || '',
        metaDescription: setting.metaDescription || '',
    };
}
