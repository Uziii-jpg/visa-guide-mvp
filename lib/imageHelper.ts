export function getCountryImage(countryCode: string): string {
    const supportedCountries = [
        "CA", "US", "MX", "BR", "AR", "CO", "CL", "PE",
        "GB", "FR", "DE", "IT", "ES", "CH", "NL", "SE", "NO", "DK", "FI", "IE", "PT", "GR", "AT", "BE", "PL", "CZ", "HU", "RO", "UA", "TR", "RU",
        "JP", "CN", "IN", "KR", "TH", "VN", "ID", "MY", "SG", "PH", "PK", "BD", "LK", "AE", "SA", "IL", "QA",
        "ZA", "EG", "MA", "NG", "KE", "TZ",
        "AU", "NZ"
    ];

    if (supportedCountries.includes(countryCode)) {
        return `/images/countries/${countryCode}.jpg`;
    }

    return "/images/countries/default.jpg";
}
