import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Label } from '../common/Label';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';

interface ExitInterview {
  _id: string;
  resignationDate: string;
  lastWorkingDay: string;
  reasonForLeaving: string;
  newEmployer?: string;
  overallExperience: number;
  managementRating: number;
  workEnvironmentRating: number;
  compensationRating: number;
  careerGrowthRating: number;
  wouldRecommend: boolean;
  wouldRejoin: boolean;
  improvements: string;
  positiveAspects: string;
  additionalComments?: string;
  status: string;
}

export const ExitInterviewPage: React.FC = () => {
  const [formData, setFormData] = useState<Partial<ExitInterview>>({
    overallExperience: 3,
    managementRating: 3,
    workEnvironmentRating: 3,
    compensationRating: 3,
    careerGrowthRating: 3,
    wouldRecommend: false,
    wouldRejoin: false,
  });
  const [existingInterview, setExistingInterview] = useState<ExitInterview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExistingInterview();
  }, []);

  const fetchExistingInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/exit-interviews/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setExistingInterview(data);
        }
      }
    } catch (err) {
      console.error('Error fetching exit interview:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/exit-interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Exit interview submitted successfully!');
        setExistingInterview(data);
      } else {
        setError(data.message || 'Failed to submit exit interview');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const RatingStars = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (existingInterview) {
    return (
      <div className="p-6">
        <Card className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Exit Interview</h1>
            <span className={`px-3 py-1 rounded-full text-sm ${
              existingInterview.status === 'Approved' ? 'bg-green-100 text-green-800' :
              existingInterview.status === 'Rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {existingInterview.status}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Resignation Date</Label>
              <p className="text-gray-900">{new Date(existingInterview.resignationDate).toLocaleDateString()}</p>
            </div>
            <div>
              <Label>Last Working Day</Label>
              <p className="text-gray-900">{new Date(existingInterview.lastWorkingDay).toLocaleDateString()}</p>
            </div>
            <div>
              <Label>Reason for Leaving</Label>
              <p className="text-gray-900">{existingInterview.reasonForLeaving}</p>
            </div>
            <div>
              <Label>Overall Experience</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={`text-2xl ${star <= existingInterview.overallExperience ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Label>Would Recommend</Label>
              <p className="text-gray-900">{existingInterview.wouldRecommend ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <Label>Improvements Suggested</Label>
              <p className="text-gray-900 whitespace-pre-wrap">{existingInterview.improvements}</p>
            </div>
            <div>
              <Label>Positive Aspects</Label>
              <p className="text-gray-900 whitespace-pre-wrap">{existingInterview.positiveAspects}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Exit Interview</h1>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="resignationDate">Resignation Date *</Label>
              <Input
                id="resignationDate"
                type="date"
                required
                onChange={(e) => handleChange('resignationDate', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="lastWorkingDay">Last Working Day *</Label>
              <Input
                id="lastWorkingDay"
                type="date"
                required
                onChange={(e) => handleChange('lastWorkingDay', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reasonForLeaving">Reason for Leaving *</Label>
            <Select
              id="reasonForLeaving"
              required
              onChange={(e) => handleChange('reasonForLeaving', e.target.value)}
            >
              <option value="">Select reason</option>
              <option value="Better Opportunity">Better Opportunity</option>
              <option value="Career Growth">Career Growth</option>
              <option value="Relocation">Relocation</option>
              <option value="Personal Reasons">Personal Reasons</option>
              <option value="Health Issues">Health Issues</option>
              <option value="Retirement">Retirement</option>
              <option value="Higher Education">Higher Education</option>
              <option value="Work-Life Balance">Work-Life Balance</option>
              <option value="Company Culture">Company Culture</option>
              <option value="Compensation">Compensation</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="newEmployer">New Employer (Optional)</Label>
            <Input
              id="newEmployer"
              type="text"
              onChange={(e) => handleChange('newEmployer', e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Ratings</h3>
            
            <div>
              <Label>Overall Experience *</Label>
              <RatingStars
                value={formData.overallExperience || 3}
                onChange={(val) => handleChange('overallExperience', val)}
              />
            </div>

            <div>
              <Label>Management *</Label>
              <RatingStars
                value={formData.managementRating || 3}
                onChange={(val) => handleChange('managementRating', val)}
              />
            </div>

            <div>
              <Label>Work Environment *</Label>
              <RatingStars
                value={formData.workEnvironmentRating || 3}
                onChange={(val) => handleChange('workEnvironmentRating', val)}
              />
            </div>

            <div>
              <Label>Compensation *</Label>
              <RatingStars
                value={formData.compensationRating || 3}
                onChange={(val) => handleChange('compensationRating', val)}
              />
            </div>

            <div>
              <Label>Career Growth *</Label>
              <RatingStars
                value={formData.careerGrowthRating || 3}
                onChange={(val) => handleChange('careerGrowthRating', val)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Would you recommend this company? *</Label>
              <Select
                required
                onChange={(e) => handleChange('wouldRecommend', e.target.value === 'true')}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>

            <div>
              <Label>Would you consider rejoining? *</Label>
              <Select
                required
                onChange={(e) => handleChange('wouldRejoin', e.target.value === 'true')}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="improvements">What could we improve? *</Label>
            <Textarea
              id="improvements"
              required
              rows={4}
              onChange={(e) => handleChange('improvements', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="positiveAspects">What did you enjoy most? *</Label>
            <Textarea
              id="positiveAspects"
              required
              rows={4}
              onChange={(e) => handleChange('positiveAspects', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="additionalComments">Additional Comments (Optional)</Label>
            <Textarea
              id="additionalComments"
              rows={3}
              onChange={(e) => handleChange('additionalComments', e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? 'Submitting...' : 'Submit Exit Interview'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
