import apper from 'https://cdn.apper.io/actions/apper-actions.js';

apper.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      message: 'Method not allowed. Only POST requests are supported.'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Retrieve CompanyHub credentials from secrets
    const companyHubProjectId = await apper.getSecret('COMPANYHUB_PROJECT_ID');
    const companyHubPublicKey = await apper.getSecret('COMPANYHUB_PUBLIC_KEY');

    // Validate secrets are available
    if (!companyHubProjectId || !companyHubPublicKey) {
      return new Response(JSON.stringify({
        success: false,
        message: 'CompanyHub credentials not configured. Please create COMPANYHUB_PROJECT_ID and COMPANYHUB_PUBLIC_KEY secrets.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse contact data from request body
    const contactData = await req.json();

    // Validate required contact fields
    if (!contactData || typeof contactData !== 'object') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid contact data provided. Expected JSON object with contact fields.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare payload with only updateable fields for CompanyHub
    const payload = {
      records: [{
        name_c: contactData.name_c || "",
        email_c: contactData.email_c || "",
        phone_c: contactData.phone_c || "",
        company_c: contactData.company_c || "",
        tags_c: contactData.tags_c || "",
        notes_c: contactData.notes_c || "",
        photo_url_c: contactData.photo_url_c || "",
        science_marks_c: contactData.science_marks_c ? Number(contactData.science_marks_c) : "",
        maths_marks_c: contactData.maths_marks_c ? Number(contactData.maths_marks_c) : "",
        chemistry_marks_c: contactData.chemistry_marks_c ? Number(contactData.chemistry_marks_c) : ""
      }]
    };

    // Use global apperClient to create contact in CompanyHub
    // Note: apperClient is automatically available in Edge Functions context
    const response = await apperClient.createRecord('contact_c', payload);

    // Handle top-level failure
    if (!response.success) {
      return new Response(JSON.stringify({
        success: false,
        message: response.message || 'Failed to create contact in CompanyHub'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle partial failures in results
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        const errorDetails = failed.map(f => f.message || 'Unknown error').join(', ');
        return new Response(JSON.stringify({
          success: false,
          message: `Failed to create contact in CompanyHub: ${errorDetails}`
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Return success with created contact data
      return new Response(JSON.stringify({
        success: true,
        data: successful[0].data,
        message: 'Contact successfully created in CompanyHub'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Unexpected response format
    return new Response(JSON.stringify({
      success: false,
      message: 'Unexpected response format from CompanyHub API'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Handle any unexpected errors
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Internal server error while creating contact in CompanyHub'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});