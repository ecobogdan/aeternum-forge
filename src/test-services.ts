// Simple test file to verify services work correctly
import { itemDataService } from './services/itemDataService';
import { nwdbService } from './services/nwdbService';

// Test function to verify services
export async function testServices() {
  console.log('Testing NWDB and Item Data Services...');
  
  try {
    // Test item search
    console.log('Testing item search...');
    const searchResults = await nwdbService.searchItems('sword', 5);
    console.log('Search results:', searchResults);
    
    if (searchResults.length > 0) {
      // Test item details
      console.log('Testing item details...');
      const itemDetails = await nwdbService.getItemDetails(searchResults[0].id);
      console.log('Item details response:', itemDetails);
      
      if (itemDetails && !itemDetails.error) {
        // Test item data processing
        console.log('Testing item data processing...');
        const processedItem = itemDataService.buildItemInfo(itemDetails.data || itemDetails);
        console.log('Processed item:', processedItem);
        
        // Test artifact objectives if it's an artifact
        if (processedItem.rarity === 100 || processedItem.rarity === 'Artifact') {
          console.log('Testing artifact objectives...');
          const objectives = await nwdbService.fetchArtifactObjectives(searchResults[0].id);
          console.log('Artifact objectives:', objectives);
        }
      }
    }
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Uncomment to run tests
// testServices();
