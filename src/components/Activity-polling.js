// This is a snippet showing how to replace SSE with polling
// Replace the SSE section in handleSearchEmails with this:

          // Poll for status updates instead of using SSE
          const pollInterval = setInterval(async () => {
            try {
              const statusResponse = await fetch(
                `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/email-search-status/${data.jobId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              
              if (!statusResponse.ok) {
                throw new Error('Failed to get job status');
              }
              
              const statusData = await statusResponse.json();
              console.log('[Gmail Polling] Status update:', statusData);
              
              // Update progress if available
              if (statusData.progress !== undefined) {
                setProgress(statusData.progress);
              }
              
              // Handle completed job
              if (statusData.state === 'completed' && statusData.result) {
                console.log('[Gmail Polling] Job completed with results:', statusData.result);
                
                // Add IDs and timestamp to each result
                const resultsWithIds = Array.isArray(statusData.result)
                  ? statusData.result.map(result => ({
                      ...result,
                      id: `gmail-${timestamp.getTime()}-${Math.random()}`,
                      searchTimestamp: timestamp
                    }))
                  : [];
                
                // Update search history with results
                setSearchHistory(prev => {
                  const updatedHistory = [...prev];
                  // Find the entry with this job ID
                  const index = updatedHistory.findIndex(entry => entry.jobId === data.jobId);
                  if (index !== -1) {
                    // Replace the entry with one that includes results
                    updatedHistory[index] = {
                      ...updatedHistory[index],
                      results: resultsWithIds
                    };
                  }
                  return updatedHistory;
                });
                
                clearInterval(pollInterval);
                setLoading(false);
                
              } else if (statusData.state === 'failed') {
                console.error('[Gmail Polling] Job failed');
                setError(`Gmail search failed: ${statusData.error || 'Unknown error'}`);
                clearInterval(pollInterval);
                setLoading(false);
              }
            } catch (error) {
              console.error('[Gmail Polling] Error checking status:', error);
              setError('Error checking job status');
              clearInterval(pollInterval);
              setLoading(false);
            }
          }, 2000); // Poll every 2 seconds