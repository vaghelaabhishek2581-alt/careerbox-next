import { getUnifiedRecommendations } from "@/lib/actions/unified-recommendations";

export default async function HTMLPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Extract search parameters
  const type = (params.type as 'institutes' | 'programs' | 'courses') || 'institutes';
  const location = params.location as string | undefined;
  const category = params.category as string | undefined;
  const instituteType = params.instituteType as string | undefined;
  const degree = params.degree as string | undefined;
  const query = params.q as string | undefined;
  const sortBy = (params.sortBy as string) || 'popularity';
  const accreditation = params.accreditation as string | undefined;
  const page = parseInt((params.page as string) || '1', 10);

  // Fetch data
  const data = await getUnifiedRecommendations({
    type,
    location,
    category,
    instituteType,
    degree,
    query,
    page,
    sortBy,
    accreditation,
  });

  // Get the data array based on type
  const items = type === 'institutes' ? data.institutes : 
                type === 'programs' ? data.programs : 
                data.courses;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a202c', marginBottom: '10px' }}>
          Explore Opportunities - CareerBox
        </h1>
        <p style={{ fontSize: '18px', color: '#718096' }}>
          Discover top institutes, programs, and courses in India
        </p>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>Total Results</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a202c' }}>{data.total}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>Current Page</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a202c' }}>{page} / {data.totalPages}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>Type</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a202c', textTransform: 'capitalize' }}>{type}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href={`?type=institutes`} style={{ 
            padding: '12px 24px', 
            textDecoration: 'none', 
            color: type === 'institutes' ? '#3b82f6' : '#718096',
            borderBottom: type === 'institutes' ? '2px solid #3b82f6' : 'none',
            fontWeight: type === 'institutes' ? 'bold' : 'normal'
          }}>
            🏢 Institutes
          </a>
          <a href={`?type=programs`} style={{ 
            padding: '12px 24px', 
            textDecoration: 'none', 
            color: type === 'programs' ? '#3b82f6' : '#718096',
            borderBottom: type === 'programs' ? '2px solid #3b82f6' : 'none',
            fontWeight: type === 'programs' ? 'bold' : 'normal'
          }}>
            🎓 Programs
          </a>
          <a href={`?type=courses`} style={{ 
            padding: '12px 24px', 
            textDecoration: 'none', 
            color: type === 'courses' ? '#3b82f6' : '#718096',
            borderBottom: type === 'courses' ? '2px solid #3b82f6' : 'none',
            fontWeight: type === 'courses' ? 'bold' : 'normal'
          }}>
            📚 Courses
          </a>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c', marginBottom: '20px' }}>
          {data.total} {type} found
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {items && items.map((item: any, index: number) => (
            <div key={item.id || index} style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              {/* Institute Card */}
              {type === 'institutes' && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    {item.logo && (
                      <img src={item.logo} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}>
                    <a href={`/${item.slug}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                      {item.name}
                    </a>
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
                    📍 {item.location?.city}, {item.location?.state}
                  </p>
                  {item.type && (
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '4px 12px', 
                      background: '#e2e8f0', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      marginBottom: '12px'
                    }}>
                      {item.type}
                    </span>
                  )}
                  <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '12px', lineHeight: '1.5' }}>
                    {item.overview?.description?.substring(0, 150)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#718096', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <span>👥 {item.campusDetails?.totalStudents || 0} Students</span>
                    <span>📚 {item.academics?.totalCourses || 0} Courses</span>
                  </div>
                </>
              )}

              {/* Program Card */}
              {type === 'programs' && (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
                    🏢 {item.institute?.name}
                  </p>
                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>
                    📍 {item.institute?.location?.city}, {item.institute?.location?.state}
                  </p>
                  {item.eligibilityExams && item.eligibilityExams.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      {item.eligibilityExams.slice(0, 3).map((exam: string) => (
                        <span key={exam} style={{ 
                          display: 'inline-block', 
                          padding: '4px 8px', 
                          background: '#dbeafe', 
                          borderRadius: '4px', 
                          fontSize: '12px',
                          marginRight: '4px',
                          marginBottom: '4px'
                        }}>
                          {exam}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: '14px', color: '#718096', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    📚 {item.courseCount} Courses
                  </div>
                </>
              )}

              {/* Course Card */}
              {type === 'courses' && (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}>
                    {item.name}
                  </h3>
                  {item.fees && (
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                      ₹{typeof item.fees === 'object' ? item.fees.amount : item.fees}
                    </p>
                  )}
                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
                    🏢 {item.institute?.name}
                  </p>
                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>
                    📍 {item.institute?.location?.city}, {item.institute?.location?.state}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {item.category && (
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '4px 12px', 
                        background: '#dbeafe', 
                        borderRadius: '4px', 
                        fontSize: '12px'
                      }}>
                        {item.category}
                      </span>
                    )}
                    {item.level && (
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '4px 12px', 
                        background: '#e2e8f0', 
                        borderRadius: '4px', 
                        fontSize: '12px'
                      }}>
                        {item.level}
                      </span>
                    )}
                  </div>
                  {item.duration && (
                    <div style={{ fontSize: '14px', color: '#718096', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                      ⏱️ Duration: {item.duration}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
          {page > 1 && (
            <a href={`?type=${type}&page=${page - 1}`} style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#3b82f6',
              fontWeight: '500'
            }}>
              ← Previous
            </a>
          )}
          <span style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: '6px', fontWeight: '500' }}>
            Page {page} of {data.totalPages}
          </span>
          {page < data.totalPages && (
            <a href={`?type=${type}&page=${page + 1}`} style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#3b82f6',
              fontWeight: '500'
            }}>
              Next →
            </a>
          )}
        </div>
      )}

      {/* Filters Info */}
      {data.filters && (
        <div style={{ marginTop: '60px', padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a202c', marginBottom: '16px' }}>
            Available Filters
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {data.filters.locations && data.filters.locations.length > 0 && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px' }}>Locations</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {data.filters.locations.slice(0, 5).map((loc: any) => (
                    <li key={loc.value} style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>
                      {loc.label} ({loc.count})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.filters.types && data.filters.types.length > 0 && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px' }}>Types</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {data.filters.types.slice(0, 5).map((t: any) => (
                    <li key={t.value} style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>
                      {t.label} ({t.count})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.filters.categories && data.filters.categories.length > 0 && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px' }}>Categories</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {data.filters.categories.slice(0, 5).map((cat: any) => (
                    <li key={cat.value} style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>
                      {cat.label} ({cat.count})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '60px', paddingTop: '20px', borderTop: '2px solid #e2e8f0', textAlign: 'center', color: '#718096' }}>
        <p>© 2024 CareerBox. All rights reserved.</p>
        <p style={{ marginTop: '8px', fontSize: '14px' }}>
          Discover top institutes, programs, and courses in India
        </p>
      </footer>
    </div>
  );
}
