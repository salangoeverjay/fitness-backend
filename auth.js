const axios = require('axios');

/**
 * OAuth 2.0 Token Manager for FatSecret API
 * Handles token fetching, caching, and automatic renewal
 */
class FatSecretAuth {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tokenUrl = 'https://oauth.fatsecret.com/connect/token';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get a valid access token (fetches new one if expired or missing)
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('Using cached access token');
      return this.accessToken;
    }

    console.log('Fetching new access token...');
    await this.fetchNewToken();
    return this.accessToken;
  }

  /**
   * Fetch a new access token from FatSecret OAuth server
   */
  async fetchNewToken() {
    try {
      const credentials = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString('base64');

      console.log('Attempting to fetch token from FatSecret...');
      console.log('Token URL:', this.tokenUrl);

      const response = await axios.post(
        this.tokenUrl,
        'grant_type=client_credentials&scope=premier image-recognition',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      
      // Set expiry time (subtract 60 seconds for safety margin)
      const expiresIn = response.data.expires_in || 86400;
      this.tokenExpiry = Date.now() + (expiresIn - 60) * 1000;

      console.log(`✓ Token fetched successfully. Expires in ${expiresIn} seconds`);
      return this.accessToken;
    } catch (error) {
      console.error('✗ Error fetching access token:');
      console.error('  Status:', error.response?.status);
      console.error('  Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('  Message:', error.message);
      throw new Error('Failed to authenticate with FatSecret API');
    }
  }

  /**
   * Clear cached token (useful for testing or manual refresh)
   */
  clearToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    console.log('Token cache cleared');
  }
}

module.exports = FatSecretAuth;
