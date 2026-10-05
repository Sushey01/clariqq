import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { MessageSquarePlus, Send, CheckCircle, Star, ThumbsUp, AlertCircle } from 'lucide-react';

export default function SystemFeedbackModal({ isOpen, onClose }) {
  const [feedbackType, setFeedbackType] = useState('review');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 2200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Feedback & Response Review"
      icon={MessageSquarePlus}
    >
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-outfit text-xl font-bold text-white">Feedback Submitted!</h3>
          <p className="text-xs text-slate-300">
            Thank you for helping us improve Clariq. Our team and pedagogical evaluation models review feedback continuously.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Feedback Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType('review')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  feedbackType === 'review'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                📝 Test Response Review
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('feature')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  feedbackType === 'feature'
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                💡 Feature Suggestion
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('bug')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  feedbackType === 'bug'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🐞 System Issue / Bug
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overall Experience Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl border transition-all ${
                    rating >= star
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Feedback or Review Comments
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what worked well, test answer accuracy, or suggested enhancements..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!comment.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-40 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Feedback
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
