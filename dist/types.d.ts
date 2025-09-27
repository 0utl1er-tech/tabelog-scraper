import * as t from 'io-ts';
export declare const RestaurantBasicInfo: t.TypeC<{
    name: t.StringC;
    rating: t.StringC;
    reviewCount: t.StringC;
    priceRange: t.StringC;
    cuisine: t.StringC;
    address: t.StringC;
    phone: t.StringC;
    hours: t.StringC;
    closedDays: t.StringC;
}>;
export declare const SeatsAndFacilities: t.TypeC<{
    totalSeats: t.StringC;
    privateRooms: t.StringC;
    smoking: t.StringC;
    parking: t.StringC;
    creditCards: t.StringC;
    wifi: t.StringC;
    otherFacilities: t.StringC;
}>;
export declare const MenuInfo: t.TypeC<{
    lunchMenu: t.StringC;
    dinnerMenu: t.StringC;
    specialMenu: t.StringC;
    drinks: t.StringC;
    otherMenu: t.StringC;
}>;
export declare const FeaturesAndRelated: t.TypeC<{
    features: t.StringC;
    atmosphere: t.StringC;
    targetAudience: t.StringC;
    occasions: t.StringC;
    reservationStatus: t.StringC;
    transportation: t.StringC;
    paymentMethods: t.StringC;
    maxReservationCapacity: t.StringC;
    spaceAndFacilities: t.StringC;
    drinks: t.StringC;
    cuisine: t.StringC;
    location: t.StringC;
    officialAccount: t.StringC;
    openingDate: t.StringC;
    relatedStoreName: t.StringC;
    relatedContact: t.StringC;
    relatedAddress: t.StringC;
    relatedHours: t.StringC;
    relatedBudget: t.StringC;
    relatedSeats: t.StringC;
    relatedPrivateRooms: t.StringC;
    relatedRental: t.StringC;
    relatedSmoking: t.StringC;
    relatedParking: t.StringC;
    relatedInfo: t.StringC;
}>;
export declare const RestaurantData: t.TypeC<{
    url: t.StringC;
    basicInfo: t.TypeC<{
        name: t.StringC;
        rating: t.StringC;
        reviewCount: t.StringC;
        priceRange: t.StringC;
        cuisine: t.StringC;
        address: t.StringC;
        phone: t.StringC;
        hours: t.StringC;
        closedDays: t.StringC;
    }>;
    seatsAndFacilities: t.TypeC<{
        totalSeats: t.StringC;
        privateRooms: t.StringC;
        smoking: t.StringC;
        parking: t.StringC;
        creditCards: t.StringC;
        wifi: t.StringC;
        otherFacilities: t.StringC;
    }>;
    menuInfo: t.TypeC<{
        lunchMenu: t.StringC;
        dinnerMenu: t.StringC;
        specialMenu: t.StringC;
        drinks: t.StringC;
        otherMenu: t.StringC;
    }>;
    featuresAndRelated: t.TypeC<{
        features: t.StringC;
        atmosphere: t.StringC;
        targetAudience: t.StringC;
        occasions: t.StringC;
        reservationStatus: t.StringC;
        transportation: t.StringC;
        paymentMethods: t.StringC;
        maxReservationCapacity: t.StringC;
        spaceAndFacilities: t.StringC;
        drinks: t.StringC;
        cuisine: t.StringC;
        location: t.StringC;
        officialAccount: t.StringC;
        openingDate: t.StringC;
        relatedStoreName: t.StringC;
        relatedContact: t.StringC;
        relatedAddress: t.StringC;
        relatedHours: t.StringC;
        relatedBudget: t.StringC;
        relatedSeats: t.StringC;
        relatedPrivateRooms: t.StringC;
        relatedRental: t.StringC;
        relatedSmoking: t.StringC;
        relatedParking: t.StringC;
        relatedInfo: t.StringC;
    }>;
}>;
export type RestaurantBasicInfoType = t.TypeOf<typeof RestaurantBasicInfo>;
export type SeatsAndFacilitiesType = t.TypeOf<typeof SeatsAndFacilities>;
export type MenuInfoType = t.TypeOf<typeof MenuInfo>;
export type FeaturesAndRelatedType = t.TypeOf<typeof FeaturesAndRelated>;
export type RestaurantDataType = t.TypeOf<typeof RestaurantData>;
export interface ScrapingError {
    url: string;
    error: string;
    timestamp: Date;
}
export type ScrapingResult = {
    success: true;
    data: RestaurantDataType;
} | {
    success: false;
    error: ScrapingError;
};
//# sourceMappingURL=types.d.ts.map