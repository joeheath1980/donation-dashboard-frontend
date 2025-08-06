const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/josephheath/giving-dashboard/.env' });

async function checkAndFixOpportunities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/matching');
    console.log('Connected to MongoDB');
    
    // Define the schema inline since we're in frontend directory
    const opportunitySchema = new mongoose.Schema({
      matchType: String,
      businessName: String,
      description: String,
      priority: Number
    }, { collection: 'matchingopportunities', strict: false });
    
    const Opportunity = mongoose.models.MatchingOpportunity || 
                        mongoose.model('MatchingOpportunity', opportunitySchema);
    
    // Count total opportunities
    const totalCount = await Opportunity.countDocuments();
    console.log(`\nTotal opportunities in database: ${totalCount}`);
    
    // Find opportunities with invalid matchType
    const invalidOpps = await Opportunity.find({ 
      matchType: { $nin: ['direct', 'category_auto', 'category_choice', 'open', 'category'] }
    });
    
    console.log(`\nOpportunities with invalid matchType: ${invalidOpps.length}`);
    
    if (invalidOpps.length > 0) {
      console.log('\nInvalid opportunities found:');
      invalidOpps.forEach(opp => {
        console.log(`  - ID: ${opp._id}, matchType: "${opp.matchType}", business: ${opp.businessName}`);
      });
      
      // Fix them
      console.log('\nFixing invalid matchTypes...');
      for (const opp of invalidOpps) {
        // Determine correct type based on data
        let newType = 'open'; // default
        
        if (opp.charity || opp.matchDetails?.matchedCharity) {
          newType = 'direct';
        } else if (opp.matchDetails?.charityOptions?.length > 0) {
          newType = 'category_choice';
        }
        
        await Opportunity.updateOne(
          { _id: opp._id },
          { $set: { matchType: newType } }
        );
        console.log(`  Fixed ${opp._id}: ${opp.matchType} -> ${newType}`);
      }
    }
    
    // Check matchType distribution
    const distribution = await Opportunity.aggregate([
      { $group: { _id: '$matchType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n=== Match Type Distribution ===');
    distribution.forEach(item => {
      console.log(`  ${item._id || 'null'}: ${item.count} opportunities`);
    });
    
    // Sample a few opportunities
    const samples = await Opportunity.find().limit(5);
    console.log('\n=== Sample Opportunities ===');
    samples.forEach(opp => {
      console.log(`  ID: ${opp._id}`);
      console.log(`    matchType: ${opp.matchType}`);
      console.log(`    business: ${opp.businessName || opp.business}`);
      console.log(`    description: ${opp.description?.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

checkAndFixOpportunities();