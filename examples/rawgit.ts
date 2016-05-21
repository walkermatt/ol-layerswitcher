require.config({
    
    baseUrl: '../src',
    
    packages: [
        {
            name: 'openlayers',
            location: 'https://cdnjs.cloudflare.com/ajax/libs/ol3/3.15.1',
            main: 'ol'
        }
    ],
    
    callback: () => {
   } 
});
