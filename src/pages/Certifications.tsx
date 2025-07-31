import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, Search, Eye, EyeOff, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CreateCertification from './CreateCertification';

interface CertificationsProps {
  onBack: () => void;
}

interface Certificate {
  id: number;
  name: string;
  courseName: string;
  published: boolean;
  studentsAttempted: number;
  studentsPassed: number;
  status: 'active' | 'inactive';
}

const mockCertificates: Certificate[] = [
  { id: 1, name: 'JavaScript Fundamentals Certificate', courseName: 'Advanced JavaScript', published: true, studentsAttempted: 125, studentsPassed: 98, status: 'active' },
  { id: 2, name: 'React Developer Certificate', courseName: 'React Development', published: true, studentsAttempted: 89, studentsPassed: 76, status: 'active' },
  { id: 3, name: 'Database Design Certificate', courseName: 'Database Design', published: false, studentsAttempted: 45, studentsPassed: 34, status: 'active' },
  { id: 4, name: 'Web Security Certificate', courseName: 'Web Security Fundamentals', published: true, studentsAttempted: 67, studentsPassed: 52, status: 'active' },
  { id: 5, name: 'Python Programming Certificate', courseName: 'Python for Beginners', published: false, studentsAttempted: 134, studentsPassed: 112, status: 'inactive' },
  { id: 6, name: 'Cloud Computing Certificate', courseName: 'Cloud Computing Basics', published: true, studentsAttempted: 78, studentsPassed: 65, status: 'active' },
  { id: 7, name: 'Mobile Development Certificate', courseName: 'Mobile App Development', published: true, studentsAttempted: 56, studentsPassed: 41, status: 'active' },
  { id: 8, name: 'Data Science Certificate', courseName: 'Data Science Essentials', published: false, studentsAttempted: 92, studentsPassed: 73, status: 'active' },
  { id: 9, name: 'Cybersecurity Certificate', courseName: 'Cybersecurity Fundamentals', published: true, studentsAttempted: 103, studentsPassed: 89, status: 'active' },
  { id: 10, name: 'Machine Learning Certificate', courseName: 'Machine Learning Basics', published: false, studentsAttempted: 71, studentsPassed: 58, status: 'active' },
  { id: 11, name: 'DevOps Certificate', courseName: 'DevOps Practices', published: true, studentsAttempted: 84, studentsPassed: 69, status: 'active' },
  { id: 12, name: 'Programming Fundamentals Certificate', courseName: 'Introduction to Programming', published: true, studentsAttempted: 156, studentsPassed: 142, status: 'active' },
];

const Certifications = ({ onBack }: CertificationsProps) => {
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const certificatesPerPage = 8;

  // Filter certificates based on search term
  const filteredCertificates = certificates.filter(certificate =>
    certificate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredCertificates.length / certificatesPerPage);
  const startIndex = (currentPage - 1) * certificatesPerPage;
  const endIndex = startIndex + certificatesPerPage;
  const currentCertificates = filteredCertificates.slice(startIndex, endIndex);

  const handleDeactivateCertificate = (certificateId: number, certificateName: string) => {
    setCertificates(prevCertificates =>
      prevCertificates.map(certificate =>
        certificate.id === certificateId
          ? { ...certificate, status: certificate.status === 'active' ? 'inactive' : 'active' }
          : certificate
      )
    );
    
    const certificate = certificates.find(c => c.id === certificateId);
    const action = certificate?.status === 'active' ? 'deactivated' : 'activated';
    toast.success(`Certificate "${certificateName}" has been ${action}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const calculatePassRate = (passed: number, attempted: number) => {
    if (attempted === 0) return 0;
    return Math.round((passed / attempted) * 100);
  };

  const handleCreateCertification = () => {
    setShowCreateForm(true);
  };

  const handleBackToList = () => {
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return <CreateCertification onBack={handleBackToList} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Certification Management</h1>
            </div>
            <Button onClick={handleCreateCertification} className="bg-orion-blue hover:bg-orion-blue-dark">
              <Plus className="h-4 w-4 mr-2" />
              Create Certification
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Certifications</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search certifications by name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate Name</TableHead>
                    <TableHead>Related Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Students Attempted</TableHead>
                    <TableHead className="text-center">Students Passed</TableHead>
                    <TableHead className="text-center">Pass Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCertificates.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell className="font-medium">{certificate.name}</TableCell>
                      <TableCell>{certificate.courseName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {certificate.published ? (
                            <>
                              <Eye className="h-4 w-4 text-green-600 mr-1" />
                              <span className="text-green-600">Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-gray-500">Draft</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{certificate.studentsAttempted}</TableCell>
                      <TableCell className="text-center">{certificate.studentsPassed}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${
                          calculatePassRate(certificate.studentsPassed, certificate.studentsAttempted) >= 80
                            ? 'text-green-600'
                            : calculatePassRate(certificate.studentsPassed, certificate.studentsAttempted) >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {calculatePassRate(certificate.studentsPassed, certificate.studentsAttempted)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={certificate.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleDeactivateCertificate(certificate.id, certificate.name)}
                        >
                          {certificate.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {currentCertificates.map((certificate) => (
                <div key={certificate.id} className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 text-sm">{certificate.name}</h3>
                    <div className="flex items-center">
                      {certificate.published ? (
                        <>
                          <Eye className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-green-600 text-xs">Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-500 text-xs">Draft</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{certificate.courseName}</p>
                  <div className="text-xs text-gray-600">
                    {certificate.studentsPassed}/{certificate.studentsAttempted} passed ({calculatePassRate(certificate.studentsPassed, certificate.studentsAttempted)}%)
                  </div>
                  <Button
                    variant={certificate.status === 'active' ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleDeactivateCertificate(certificate.id, certificate.name)}
                    className="w-full"
                  >
                    {certificate.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => setCurrentPage(index + 1)}
                          isActive={currentPage === index + 1}
                          className="cursor-pointer"
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Certifications;
