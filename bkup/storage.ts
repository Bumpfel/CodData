class bkup {
  
  private attachmentData: any = {}

  // BKUP variable storage (working). clears on refresh
  async getAttachmentData_var(weaponName: string): Promise<any> {
    let result: any
    
    if(!this.attachmentData[weaponName]) {
      console.log('fetching new data')
      result = await TgdService.getAttachmentData(weaponName)
      this.attachmentData[weaponName] = result
    } else {
      result = this.attachmentData[weaponName]
    }
    return result
  }
  
  // BKUP sessionStorage (working). clears on browser close. currently saving other stuff in sessionStorage, so that has to be dealt with if used
  async getAttachmentData_session(weaponName: string): Promise<any> { 
    // expiration date in 24 hrs
    const dayInMs = 24 * 60 * 60 * 1000
    const expirationDate = Date.now() + dayInMs
    const readableExpirationDate = new Date(expirationDate).toUTCString()
    
    document.cookie = "key=value; expires=" + readableExpirationDate
    
    
    let result: any
    let cachedData = JSON.parse(window.sessionStorage.getItem('attachmentData')) || {}
    
    if(!cachedData[weaponName]) {
      console.log('fetching new data')
      result = await TgdService.getAttachmentData(weaponName)
      cachedData[weaponName] = result
      window.sessionStorage.setItem('attachmentData', JSON.stringify(cachedData))
    } else {
      result = cachedData[weaponName]
    }
    return result
  }

  // not working since cookie can't store this amount of information
  /**
   * Fetches data from API. Uses cookies to store it for 24 hrs to make the site more responsive and avoid multiple back to back API calls for the same data
   * @param weaponName 
  */
  private async getAttachmentData_cookies(weaponName: string): Promise<any> {
    // expiration date in 24 hrs
    const dayInMs = 24 * 60 * 60 * 1000
    const expirationDate = Date.now() + dayInMs
    const readableExpirationDate = new Date(expirationDate).toUTCString()
    
    let cachedData = document.cookie[weaponName]
    let result: any
    
    if(!cachedData) {
      console.log('fetching new data')
      result = await TgdService.getAttachmentData(weaponName)

      let optics: [] = result.filter(attachment => attachment.slot === 'Optic')

      console.log(optics, JSON.stringify(optics).length)

      // document.cookie = weaponName + '=' + JSON.stringify(optics) + '; samesite=strict; expires=' + readableExpirationDate
    } else {
      result = JSON.parse(cachedData[weaponName])
    }
    return result
  }
}