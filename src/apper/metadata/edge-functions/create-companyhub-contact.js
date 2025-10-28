import apper from 'https://cdn.apper.io/actions/apper-actions.js';

apper.serve(async (req) => {
  try {
    // Parse request body
    const contactData = await req.json();

    // Validate required fields
    if (!contactData.name_c || !contactData.email_c) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: name_c and email_c are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Retrieve CompanyHub API key from secrets
    const apiKey = await apper.getSecret('COMPANYHUB_API_KEY');
    
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        message: 'CompanyHub API key not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare CompanyHub contact payload
    const companyHubPayload = {
      name: contactData.name_c || '',
      email: contactData.email_c || '',
      phone: contactData.phone_c || '',
      company: contactData.company_c || '',
      tags: contactData.tags_c || '',
      notes: contactData.notes_c || '',
      photo_url: contactData.photo_url_c || '',
      science_marks: contactData.science_marks_c ? Number(contactData.science_marks_c) : 0,
      maths_marks: contactData.maths_marks_c ? Number(contactData.maths_marks_c) : 0,
      chemistry_marks: contactData.chemistry_marks_c ? Number(contactData.chemistry_marks_c) : 0
    };

    // Call CompanyHub API
    const companyHubResponse = await fetch('https://api.companyhub.com/v1/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(companyHubPayload)
    });

    // Check if CompanyHub API call was successful
    if (!companyHubResponse.ok) {
      const errorText = await companyHubResponse.text();
      let errorMessage = 'CompanyHub API request failed';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return new Response(JSON.stringify({
        success: false,
        message: `CompanyHub API error: ${errorMessage}`,
        statusCode: companyHubResponse.status
      }), {
        status: companyHubResponse.status === 401 ? 401 : 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse CompanyHub response
    const companyHubData = await companyHubResponse.json();

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Contact successfully synced to CompanyHub',
      data: companyHubData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Handle any unexpected errors
    return new Response(JSON.stringify({
      success: false,
      message: `Error syncing contact to CompanyHub: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});